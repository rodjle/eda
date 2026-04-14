const fs = require("fs");
const path = require("path");

const c = {
  reset:       "\x1b[0m",
  bold:        "\x1b[1m",
  green:       "\x1b[32m",
  brightGreen: "\x1b[92m",
  cyan:        "\x1b[36m",
  yellow:      "\x1b[33m",
  red:         "\x1b[31m",
  gray:        "\x1b[90m",
  white:       "\x1b[97m",
  bgGreen:     "\x1b[42m",
};

function logFilePath() {
  const data = new Date().toISOString().slice(0, 10);
  const dir = path.resolve(__dirname, "logs");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `view-${data}.log`);
}

function agora() {
  return new Date().toLocaleString("pt-BR");
}

function escreverLog(nivel, mensagem) {
  const linha = `[${agora()}] [${nivel}] ${mensagem}\n`;
  try {
    fs.appendFileSync(logFilePath(), linha, "utf-8");
  } catch (_) {}
}

function timestamp() {
  return `${c.gray}[${agora()}]${c.reset}`;
}

function logStep(message) {
  console.log(`${timestamp()} ${c.cyan}[VIEW]${c.reset} ${message}`);
}

function logWarning(message) {
  console.warn(`${timestamp()} ${c.yellow}[VIEW][AVISO]${c.reset} ${message}`);
  escreverLog("AVISO", message);
}

function logError(message, error) {
  const detalhe = error ? String(error) : "";
  console.error(`${timestamp()} ${c.red}[VIEW][ERRO]${c.reset} ${message}`, detalhe);
  escreverLog("ERRO", `${message} ${detalhe}`.trim());
}

function logHtmlGerado(caminho, resumo) {
  const agr = agora();
  const linha = "═".repeat(62);
  console.log(`\n${c.brightGreen}${linha}${c.reset}`);
  console.log(`${c.bgGreen}${c.bold}${c.white}  ✔  HTML GERADO COM SUCESSO  ${c.reset}`);
  console.log(`${c.brightGreen}  Data/Hora : ${c.bold}${agr}${c.reset}`);
  console.log(`${c.brightGreen}  Arquivo   : ${c.bold}${caminho}${c.reset}`);
  console.log(`${c.brightGreen}  Alunos    : ${c.bold}${resumo.totalAlunos ?? 0}${c.reset}`);
  console.log(`${c.brightGreen}  Média     : ${c.bold}${Number(resumo.mediaTurma ?? 0).toFixed(2)}${c.reset}`);
  console.log(`${c.brightGreen}${linha}${c.reset}\n`);
  escreverLog("SUCESSO", `HTML gerado em '${caminho}'. Alunos: ${resumo.totalAlunos ?? 0}, Media: ${Number(resumo.mediaTurma ?? 0).toFixed(2)}`);
}

module.exports = { logStep, logWarning, logError, logHtmlGerado };
