function calcularResumo(payload) {
  if (!payload || !Array.isArray(payload.alunos)) {
    throw new Error("Payload invalido. Era esperado um objeto com a propriedade 'alunos'.");
  }

  const alunosMap = new Map();

  for (const item of payload.alunos) {
    if (item == null || item.nome == null) {
      continue;
    }

    const chave = item.nome.trim().toLowerCase();

    const atual = alunosMap.get(chave) || {
      id: item.id,
      nome: item.nome,
      trabalhos: [],
      somaNotas: 0,
      quantidadeNotas: 0
    };

    if (item.trabalho) {
      atual.trabalhos.push(item.trabalho);
    }

    const nota = Number(item.nota);
    if (!Number.isNaN(nota)) {
      atual.somaNotas += nota;
      atual.quantidadeNotas += 1;
    }

    alunosMap.set(chave, atual);
  }

  const alunos = Array.from(alunosMap.values())
    .map((aluno) => {
      const media = aluno.quantidadeNotas === 0 ? 0 : aluno.somaNotas / aluno.quantidadeNotas;

      return {
        id: aluno.id,
        nome: aluno.nome,
        trabalhos: aluno.trabalhos,
        media: Number(media.toFixed(2)),
        quantidadeNotas: aluno.quantidadeNotas,
        status: media >= 7 ? "Aprovado" : "Reprovado"
      };
    })
    .sort((primeiro, segundo) => primeiro.nome.localeCompare(segundo.nome, "pt-BR"));

  const mediaTurma =
    alunos.length === 0
      ? 0
      : Number(
          (alunos.reduce((total, aluno) => total + aluno.media, 0) / alunos.length).toFixed(2)
        );

  return {
    evento: "ResumoNotasGerado",
    geradoEm: new Date().toISOString(),
    totalAlunos: alunos.length,
    mediaTurma,
    alunos
  };
}

module.exports = { calcularResumo };
