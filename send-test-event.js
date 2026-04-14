const https = require("https");
const { randomUUID } = require("crypto");

const endpoint = process.env.EVENTGRID_ENDPOINT;
const accessKey = process.env.EVENTGRID_KEY;

const resumo = {
  evento: "ResumoNotasGerado",
  geradoEm: new Date().toISOString(),
  totalAlunos: 5,
  mediaTurma: 7.80,
  alunos: [
    { nome: "Ana Lima",       trabalhos: ["Lab 1", "Lab 2"], media: 8.75, quantidadeNotas: 2, status: "Aprovado" },
    { nome: "Carlos Souza",   trabalhos: ["Lab 1", "Lab 2"], media: 5.75, quantidadeNotas: 2, status: "Reprovado" },
    { nome: "Beatriz Santos", trabalhos: ["Lab 1"],          media: 7.00, quantidadeNotas: 1, status: "Aprovado" },
    { nome: "Pedro Alves",    trabalhos: ["Lab 1", "Lab 2"], media: 9.00, quantidadeNotas: 2, status: "Aprovado" },
    { nome: "Maria Costa",    trabalhos: ["Lab 1"],          media: 6.50, quantidadeNotas: 1, status: "Reprovado" }
  ]
};

const evento = [
  {
    id: randomUUID(),
    eventType: "ResumoNotasGerado",
    subject: "notas/resumo",
    eventTime: new Date().toISOString(),
    dataVersion: "1.0",
    data: resumo
  }
];

const body = JSON.stringify(evento);
const url = new URL(endpoint);

const req = https.request(
  {
    hostname: url.hostname,
    path: url.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
      "aeg-sas-key": accessKey
    }
  },
  (res) => {
    let data = "";
    res.on("data", (chunk) => { data += chunk; });
    res.on("end", () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`\x1b[32m[OK] Evento enviado ao topico! Status: ${res.statusCode}\x1b[0m`);
      } else {
        console.error(`\x1b[31m[ERRO] Status: ${res.statusCode} - ${data}\x1b[0m`);
      }
    });
  }
);

req.on("error", (e) => console.error("\x1b[31m[ERRO]\x1b[0m", e.message));
req.write(body);
req.end();
