const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m"
};

function logStep(message) {
  console.log(`${colors.cyan}[PROCESSOR]${colors.reset} ${message}`);
}

function logWarning(message) {
  console.warn(`${colors.yellow}[PROCESSOR]${colors.reset} ${message}`);
}

function logError(message, error) {
  console.error(`${colors.red}[PROCESSOR]${colors.reset} ${message}`, error);
}

function logSuccess(message) {
  console.log(`${colors.green}[SUCESSO]${colors.reset} ${message}`);
}

function logDebug(label, value) {
  console.log(`[DEBUG] ${label}:`, JSON.stringify(value, null, 2));
}

module.exports = { logStep, logWarning, logError, logSuccess, logDebug };
