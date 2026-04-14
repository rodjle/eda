const https = require("https");
const { randomUUID } = require("crypto");

const endpoint = process.env.EVENTGRID_ENDPOINT;
const accessKey = process.env.EVENTGRID_KEY;

const eventos = [
  {
    nome: "Turma A - Labs",
    totalAlunos: 10,
    mediaTurma: 7.35,
    alunos: [
      { nome: "Ana Lima",        trabalhos: ["Lab 1","Lab 2"], media: 8.75, quantidadeNotas: 2, status: "Aprovado" },
      { nome: "Carlos Souza",    trabalhos: ["Lab 1","Lab 2"], media: 5.75, quantidadeNotas: 2, status: "Reprovado" },
      { nome: "Beatriz Santos",  trabalhos: ["Lab 1","Lab 2"], media: 7.50, quantidadeNotas: 2, status: "Aprovado" },
      { nome: "Pedro Alves",     trabalhos: ["Lab 1","Lab 2"], media: 6.75, quantidadeNotas: 2, status: "Reprovado" },
      { nome: "Maria Costa",     trabalhos: ["Lab 1","Lab 2"], media: 9.25, quantidadeNotas: 2, status: "Aprovado" },
      { nome: "Lucas Ferreira",  trabalhos: ["Lab 1","Lab 2"], media: 5.00, quantidadeNotas: 2, status: "Reprovado" },
      { nome: "Juliana Rocha",   trabalhos: ["Lab 1","Lab 2"], media: 7.50, quantidadeNotas: 2, status: "Aprovado" },
      { nome: "Rafael Mendes",   trabalhos: ["Lab 1","Lab 2"], media: 6.25, quantidadeNotas: 2, status: "Reprovado" },
      { nome: "Fernanda Gomes",  trabalhos: ["Lab 1","Lab 2"], media: 7.75, quantidadeNotas: 2, status: "Aprovado" },
      { nome: "Thiago Barbosa",  trabalhos: ["Lab 1","Lab 2"], media: 3.50, quantidadeNotas: 2, status: "Reprovado" },
    ]
  },
  {
    nome: "Turma B - Seminário + TCC",
    totalAlunos: 10,
    mediaTurma: 7.10,
    alunos: [
      { nome: "Camila Nunes",    trabalhos: ["Seminário","TCC"], media: 8.75, quantidadeNotas: 2, status: "Aprovado" },
      { nome: "Bruno Carvalho",  trabalhos: ["Seminário","TCC"], media: 4.75, quantidadeNotas: 2, status: "Reprovado" },
      { nome: "Larissa Teixeira",trabalhos: ["Seminário","TCC"], media: 8.00, quantidadeNotas: 2, status: "Aprovado" },
      { nome: "Diego Moreira",   trabalhos: ["Seminário","TCC"], media: 6.50, quantidadeNotas: 2, status: "Reprovado" },
      { nome: "Isabela Ramos",   trabalhos: ["Seminário","TCC"], media: 8.75, quantidadeNotas: 2, status: "Aprovado" },
      { nome: "Felipe Cardoso",  trabalhos: ["Seminário","TCC"], media: 5.00, quantidadeNotas: 2, status: "Reprovado" },
      { nome: "Natália Pinto",   trabalhos: ["Seminário","TCC"], media: 7.25, quantidadeNotas: 2, status: "Aprovado" },
      { nome: "Gustavo Lima",    trabalhos: ["Seminário","TCC"], media: 4.75, quantidadeNotas: 2, status: "Reprovado" },
      { nome: "Tatiane Souza",   trabalhos: ["Seminário","TCC"], media: 8.75, quantidadeNotas: 2, status: "Aprovado" },
      { nome: "Eduardo Melo",    trabalhos: ["Seminário","TCC"], media: 5.75, quantidadeNotas: 2, status: "Reprovado" },
    ]
  },
  {
    nome: "Turma C - Projeto Final",
    totalAlunos: 8,
    mediaTurma: 7.44,
    alunos: [
      { nome: "Ana Lima",        trabalhos: ["Projeto Final","Revisão"], media: 9.75, quantidadeNotas: 2, status: "Aprovado" },
      { nome: "Carlos Souza",    trabalhos: ["Projeto Final","Revisão"], media: 7.75, quantidadeNotas: 2, status: "Aprovado" },
      { nome: "Camila Nunes",    trabalhos: ["Projeto Final","Revisão"], media: 8.75, quantidadeNotas: 2, status: "Aprovado" },
      { nome: "Bruno Carvalho",  trabalhos: ["Projeto Final","Revisão"], media: 3.75, quantidadeNotas: 2, status: "Reprovado" },
      { nome: "Aline Martins",   trabalhos: ["Projeto Final","Revisão"], media: 8.25, quantidadeNotas: 2, status: "Aprovado" },
      { nome: "Roberto Dias",    trabalhos: ["Projeto Final","Revisão"], media: 5.50, quantidadeNotas: 2, status: "Reprovado" },
      { nome: "Vanessa Ribeiro", trabalhos: ["Projeto Final","Revisão"], media: 9.25, quantidadeNotas: 2, status: "Aprovado" },
      { nome: "Marcos Oliveira", trabalhos: ["Projeto Final","Revisão"], media: 4.75, quantidadeNotas: 2, status: "Reprovado" },
    ]
  }
];

function enviar(resumo, indice) {
  return new Promise((resolve) => {
    const evento = [{
      id: randomUUID(),
      eventType: "ResumoNotasGerado",
      subject: "notas/resumo",
      eventTime: new Date().toISOString(),
      dataVersion: "1.0",
      data: {
        evento: "ResumoNotasGerado",
        geradoEm: new Date().toISOString(),
        totalAlunos: resumo.totalAlunos,
        mediaTurma: resumo.mediaTurma,
        alunos: resumo.alunos
      }
    }];

    const body = JSON.stringify(evento);
    const url = new URL(endpoint);

    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        "aeg-sas-key": accessKey
      }
    }, (res) => {
      res.resume();
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`\x1b[32m[OK]\x1b[0m Evento ${indice + 1} enviado: "${resumo.nome}" (${resumo.totalAlunos} alunos, média ${resumo.mediaTurma})`);
        } else {
          console.error(`\x1b[31m[ERRO]\x1b[0m Evento ${indice + 1} falhou: status ${res.statusCode}`);
        }
        resolve();
      });
    });

    req.on("error", (e) => {
      console.error(`\x1b[31m[ERRO]\x1b[0m Evento ${indice + 1}:`, e.message);
      resolve();
    });

    req.write(body);
    req.end();
  });
}

(async () => {
  console.log(`\x1b[36mEnviando ${eventos.length} eventos ao topico...\x1b[0m\n`);
  for (let i = 0; i < eventos.length; i++) {
    await enviar(eventos[i], i);
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`\n\x1b[36mPronto!\x1b[0m`);
})();
