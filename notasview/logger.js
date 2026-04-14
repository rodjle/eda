const c = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  green:  "\x1b[32m",
  brightGreen: "\x1b[92m",
  cyan:   "\x1b[36m",
  yellow: "\x1b[33m",
  red:    "\x1b[31m",
  gray:   "\x1b[90m",
  white:  "\x1b[97m",
  bgGreen: "\x1b[42m",
};

function timestamp() {
  return `${c.gray}[${new Date().toLocaleString("pt-BR")}]${c.reset}`;
}

function logStep(message) {
  console.log(`${timestamp()} ${c.cyan}[VIEW]${c.reset} ${message}`);
}

function logWarning(message) {
  console.warn(`${timestamp()} ${c.yellow}[VIEW][AVISO]${c.reset} ${message}`);
}

function logError(message, error) {
  console.error(`${timestamp()} ${c.red}[VIEW][ERRO]${c.reset} ${message}`, error ?? "");
}

function logHtmlGerado(caminho, resumo) {
  const agora = new Date().toLocaleString("pt-BR");
  const linha = "═".repeat(60);
  console.log(`\n${c.brightGreen}${linha}${c.reset}`);
  console.log(`${c.bgGreen}${c.bold}${c.white}  ✔  HTML GERADO COM SUCESSO  ${c.reset}`);
  console.log(`${c.brightGreen}  Data/Hora : ${c.bold}${agora}${c.reset}`);
  console.log(`${c.brightGreen}  Arquivo   : ${c.bold}${caminho}${c.reset}`);
  console.log(`${c.brightGreen}  Alunos    : ${c.bold}${resumo.totalAlunos ?? 0}${c.reset}`);
  console.log(`${c.brightGreen}  Média     : ${c.bold}${Number(resumo.mediaTurma ?? 0).toFixed(2)}${c.reset}`);
  console.log(`${c.brightGreen}${linha}${c.reset}\n`);
}

module.exports = { logStep, logWarning, logError, logHtmlGerado };
