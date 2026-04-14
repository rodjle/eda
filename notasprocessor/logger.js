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
  bgRed:       "\x1b[41m",
};

function logFilePath() {
  const data = new Date().toISOString().slice(0, 10);
  const dir = path.resolve(__dirname, "logs");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `processor-${data}.log`);
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
  console.log(`${timestamp()} ${c.cyan}[PROCESSOR]${c.reset} ${message}`);
}

function logWarning(message) {
  console.warn(`${timestamp()} ${c.yellow}[PROCESSOR][AVISO]${c.reset} ${message}`);
  escreverLog("AVISO", message);
}

function logError(message, error) {
  const detalhe = error ? String(error) : "";
  console.error(`${timestamp()} ${c.red}[PROCESSOR][ERRO]${c.reset} ${message}`, detalhe);
  escreverLog("ERRO", `${message} ${detalhe}`.trim());
}

function logSuccess(resumo, topico) {
  const linha = "═".repeat(62);
  const agr = agora();
  console.log(`\n${c.brightGreen}${linha}${c.reset}`);
  console.log(`${c.bgGreen}${c.bold}${c.white}  ✔  ENVIADO AO TOPICO COM SUCESSO  ${c.reset}`);
  console.log(`${c.brightGreen}  Data/Hora : ${c.bold}${agr}${c.reset}`);
  console.log(`${c.brightGreen}  Tópico    : ${c.bold}${topico}${c.reset}`);
  console.log(`${c.brightGreen}  Alunos    : ${c.bold}${resumo.totalAlunos ?? 0}${c.reset}`);
  console.log(`${c.brightGreen}  Média     : ${c.bold}${Number(resumo.mediaTurma ?? 0).toFixed(2)}${c.reset}`);
  console.log(`${c.brightGreen}${linha}${c.reset}\n`);
  escreverLog("SUCESSO", `Resumo enviado ao topico '${topico}'. Alunos: ${resumo.totalAlunos ?? 0}, Media: ${Number(resumo.mediaTurma ?? 0).toFixed(2)}`);
}

function logDebug(label, value) {
  console.log(`${timestamp()} ${c.gray}[DEBUG]${c.reset} ${label}:`, JSON.stringify(value, null, 2));
}

module.exports = { logStep, logWarning, logError, logSuccess, logDebug };
