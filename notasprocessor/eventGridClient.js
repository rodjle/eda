const https = require("https");
const { randomUUID } = require("crypto");
const { eventGridTopicEndpoint, eventGridAccessKey } = require("./config");
const { logStep } = require("./logger");

async function publicarEventoResumo(resumo) {
  const endpoint = new URL(eventGridTopicEndpoint);
  logStep(`Montando evento '${resumo.evento}' para envio ao Event Grid.`);

  const evento = [
    {
      id: randomUUID(),
      eventType: resumo.evento,
      subject: "notas/resumo",
      eventTime: new Date().toISOString(),
      dataVersion: "1.0",
      data: resumo
    }
  ];

  const body = JSON.stringify(evento);

  await new Promise((resolve, reject) => {
    logStep(`Enviando evento HTTP POST para '${eventGridTopicEndpoint}'.`);

    const request = https.request(
      {
        protocol: endpoint.protocol,
        hostname: endpoint.hostname,
        port: endpoint.port || 443,
        path: `${endpoint.pathname}${endpoint.search}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Length": Buffer.byteLength(body),
          "aeg-sas-key": eventGridAccessKey
        }
      },
      (response) => {
        let responseBody = "";

        response.on("data", (chunk) => { responseBody += chunk.toString(); });

        response.on("end", () => {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            logStep(`Event Grid respondeu com status ${response.statusCode}.`);
            resolve();
            return;
          }

          reject(
            new Error(
              `Falha ao publicar no Event Grid. Status: ${response.statusCode}. Resposta: ${responseBody}`
            )
          );
        });
      }
    );

    request.on("error", reject);
    request.write(body);
    request.end();
  });
}

module.exports = { publicarEventoResumo };
