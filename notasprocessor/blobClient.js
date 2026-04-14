const { BlobServiceClient } = require("@azure/storage-blob");
const { storageConnectionString } = require("./config");

const blobServiceClient = BlobServiceClient.fromConnectionString(storageConnectionString);

function parseMessageBody(body) {
  if (body == null) {
    throw new Error("Mensagem vazia.");
  }

  if (typeof body === "string") {
    return JSON.parse(body);
  }

  if (Buffer.isBuffer(body)) {
    return JSON.parse(body.toString("utf-8"));
  }

  return body;
}

async function downloadBlob(url) {
  const parsed = new URL(url);
  const parts = parsed.pathname.split("/").filter(Boolean);
  const containerName = parts[0];
  const blobName = parts.slice(1).join("/");

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);

  const downloadResponse = await blobClient.download();

  const chunks = [];
  for await (const chunk of downloadResponse.readableStreamBody) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const content = Buffer.concat(chunks).toString("utf-8");

  try {
    return JSON.parse(content);
  } catch (e) {
    throw new Error(`Blob baixado mas conteudo nao e JSON valido. URL: ${url}`);
  }
}

module.exports = { parseMessageBody, downloadBlob };
