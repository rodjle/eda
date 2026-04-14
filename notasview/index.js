const { ServiceBusClient } = require("@azure/service-bus");
const { connectionString, queueName, outputPath } = require("./config");
const { logStep, logWarning, logError, logHtmlGerado } = require("./logger");
const { salvarHtml } = require("./htmlGenerator");

function parseMessageBody(body) {
  if (body == null) {
    throw new Error("Mensagem vazia.");
  }

  if (typeof body === "string") {
    return JSON.parse(body);
  }

  if (Buffer.isBuffer(body)) {
    return JSON.parse(body.toString("utf-8"));
  }

  return body;
}

async function iniciar() {
  logStep(`Iniciando notasview.`);
  logStep(`Conectando ao Azure Service Bus na fila '${queueName}'.`);

  const client = new ServiceBusClient(connectionString);
  const receiver = client.createReceiver(queueName);

  logStep(`Consumidor pronto. Aguardando mensagens na fila '${queueName}'.`);
  logStep(`HTMLs serao salvos em '${outputPath}'.`);

  receiver.subscribe({
    processMessage: async (mensagem) => {
      try {
        logStep(`Mensagem recebida. SequenceNumber: ${mensagem.sequenceNumber}.`);
        logStep("Convertendo corpo da mensagem para JSON.");
        const resumo = parseMessageBody(mensagem.body);

        logStep(`Payload recebido. ${resumo.totalAlunos ?? 0} aluno(s), media da turma: ${resumo.mediaTurma ?? 0}.`);
        logStep("Gerando HTML...");

        const caminho = await salvarHtml(resumo);

        logStep("Confirmando mensagem na fila.");
        await receiver.completeMessage(mensagem);

        logHtmlGerado(caminho, resumo);
      } catch (error) {
        const erroDeValidacao =
          error instanceof SyntaxError ||
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
    logStep("Encerrando notasview...");
    await receiver.close();
    await client.close();
    process.exit(0);
  };

  process.on("SIGINT", encerrar);
  process.on("SIGTERM", encerrar);
}

iniciar().catch((error) => {
  logError("Erro ao iniciar notasview:", error);
  process.exit(1);
});
