const fs = require("fs");
const path = require("path");
const { ServiceBusClient } = require("@azure/service-bus");
const { connectionString, queueName, eventGridTopicEndpoint } = require("./config");
const { logStep, logWarning, logError, logSuccess, logDebug } = require("./logger");
const { parseMessageBody, downloadBlob } = require("./blobClient");
const { calcularResumo } = require("./resumoService");
const { publicarEventoResumo } = require("./eventGridClient");

const PID_FILE = path.resolve(__dirname, "notasprocessor.pid");

function verificarInstanciaUnica() {
  if (fs.existsSync(PID_FILE)) {
    const pid = parseInt(fs.readFileSync(PID_FILE, "utf-8").trim(), 10);
    try {
      process.kill(pid, 0);
      console.error(`[ERRO] Ja existe uma instancia rodando (PID ${pid}). Encerrando.`);
      process.exit(1);
    } catch (_) {
      // processo morto, PID file obsoleto — pode continuar
    }
  }
  fs.writeFileSync(PID_FILE, String(process.pid), "utf-8");
  const limpar = () => { try { fs.unlinkSync(PID_FILE); } catch (_) {} };
  process.on("exit", limpar);
  process.on("SIGINT", () => { limpar(); process.exit(0); });
  process.on("SIGTERM", () => { limpar(); process.exit(0); });
}

verificarInstanciaUnica();

async function iniciar() {
  logStep("Iniciando notasprocessor.");
  logStep(`Conectando ao Azure Service Bus na fila '${queueName}'.`);

  const client = new ServiceBusClient(connectionString);
  const receiver = client.createReceiver(queueName);

  logStep(`Consumidor pronto. Aguardando mensagens na fila '${queueName}'.`);
  logStep(`Os resumos serao publicados no Event Grid '${eventGridTopicEndpoint}'.`);

  receiver.subscribe({
    processMessage: async (mensagem) => {
      try {
        logStep(`Mensagem recebida. SequenceNumber: ${mensagem.sequenceNumber}.`);
        logStep("Lendo e convertendo o corpo da mensagem para JSON.");
        logDebug("body bruto", mensagem.body);
        const envelope = parseMessageBody(mensagem.body);

        let payload;
        if (envelope.eventType === "Microsoft.Storage.BlobCreated" && envelope.data && envelope.data.url) {
          logStep(`Evento BlobCreated detectado. Baixando blob: ${envelope.data.url}`);
          payload = await downloadBlob(envelope.data.url);
          logStep("Blob baixado e parseado com sucesso.");
        } else {
          payload = envelope;
        }

        logDebug("payload parseado", payload);
        logStep(`Payload recebido com ${Array.isArray(payload.alunos) ? payload.alunos.length : 0} registro(s) de aluno(s).`);
        logStep("Calculando media e consolidando o resumo por aluno.");
        const resumo = calcularResumo(payload);

        logStep("Resumo calculado. Publicando no topico do Event Grid.");
        await publicarEventoResumo(resumo);

        logStep("Confirmando a mensagem como processada na fila de entrada.");
        await receiver.completeMessage(mensagem);

        logSuccess(resumo, eventGridTopicEndpoint);
      } catch (error) {
        const erroDeValidacao =
          error instanceof SyntaxError ||
          (error.message && error.message.startsWith("Payload invalido")) ||
          (error.message && error.message.startsWith("Mensagem vazia"));

        if (erroDeValidacao) {
          logWarning("Mensagem com estrutura invalida. Enviando para dead-letter e continuando.");
          await receiver.deadLetterMessage(mensagem, {
            deadLetterReason: "PayloadInvalido",
            deadLetterErrorDescription: error.message
          });
        } else {
          logWarning("Falha transiente. A mensagem sera devolvida para nova tentativa.");
          await receiver.abandonMessage(mensagem);
        }
        logError("Erro ao processar a mensagem:", error.message);
      }
    },
    processError: async (args) => {
      logError("Erro no consumidor:", args.error);
    }
  });

  const encerrar = async () => {
    logStep("Encerrando notasprocessor...");
    await receiver.close();
    await client.close();
    process.exit(0);
  };

  process.on("SIGINT", encerrar);
  process.on("SIGTERM", encerrar);
}

iniciar().catch((error) => {
  logError("Erro ao iniciar notasprocessor:", error);
  process.exit(1);
});
