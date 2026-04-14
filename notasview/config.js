const fs = require("fs");
const path = require("path");

function loadEnvFile() {
  const envPath = path.resolve(__dirname, ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, "utf-8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (key && process.env[key] == null) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING;
const queueName = process.env.SERVICE_BUS_QUEUE_NAME;
const outputPath = process.env.HTML_OUTPUT_PATH || "./saida/resumo.html";

if (!connectionString || !queueName) {
  throw new Error(
    "Defina SERVICE_BUS_CONNECTION_STRING e SERVICE_BUS_QUEUE_NAME no arquivo .env."
  );
}

module.exports = { connectionString, queueName, outputPath };
