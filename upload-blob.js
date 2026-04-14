const { BlobServiceClient } = require("@azure/storage-blob");
const fs = require("fs");
const path = require("path");

const STORAGE_CONNECTION_STRING = process.env.STORAGE_CONNECTION_STRING;
const CONTAINER = "uploads";

const arquivos = [
  path.resolve(__dirname, "arquivos/turma-labs.json"),
  path.resolve(__dirname, "arquivos/turma-seminario.json"),
  path.resolve(__dirname, "arquivos/turma-projeto.json"),
];

async function upload(filePath) {
  const blobName = path.basename(filePath);
  const client = BlobServiceClient.fromConnectionString(STORAGE_CONNECTION_STRING);
  const container = client.getContainerClient(CONTAINER);
  const blob = container.getBlockBlobClient(blobName);

  const content = fs.readFileSync(filePath);
  await blob.upload(content, content.length, {
    blobHTTPHeaders: { blobContentType: "application/json" }
  });

  console.log(`\x1b[32m[OK]\x1b[0m Upload concluído: ${blobName}`);
}

(async () => {
  const alvo = process.argv[2];

  if (alvo) {
    const filePath = path.resolve(__dirname, alvo);
    console.log(`\x1b[36mEnviando ${path.basename(filePath)} para o blob...\x1b[0m`);
    await upload(filePath);
  } else {
    console.log(`\x1b[36mEnviando ${arquivos.length} arquivos para o blob...\x1b[0m\n`);
    for (const f of arquivos) {
      await upload(f);
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`\n\x1b[36mPronto! O notasprocessor vai pegar as mensagens da fila e publicar no Event Grid.\x1b[0m`);
})();
