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
const eventGridTopicEndpoint = process.env.EVENT_GRID_TOPIC_ENDPOINT;
const eventGridAccessKey = process.env.EVENT_GRID_ACCESS_KEY;
const storageConnectionString = process.env.STORAGE_CONNECTION_STRING;

if (!connectionString || !queueName || !eventGridTopicEndpoint || !eventGridAccessKey || !storageConnectionString) {
  throw new Error(
    "Defina SERVICE_BUS_CONNECTION_STRING, SERVICE_BUS_QUEUE_NAME, EVENT_GRID_TOPIC_ENDPOINT, EVENT_GRID_ACCESS_KEY e STORAGE_CONNECTION_STRING no arquivo .env."
  );
}

module.exports = { connectionString, queueName, eventGridTopicEndpoint, eventGridAccessKey, storageConnectionString };
