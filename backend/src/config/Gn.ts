import path from "path";
import fs from "fs";

const name = process.env.GERENCIANET_SANDBOX === "false" ? "producao" : "homologacao";

// Valida variáveis de ambiente obrigatórias
const requiredEnvVars = [
  'GERENCIANET_CLIENT_ID',
  'GERENCIANET_CLIENT_SECRET',
  'GERENCIANET_PIX_CERT',
  'GERENCIANET_CHAVEPIX'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(`⚠️  AVISO: Variáveis de ambiente do Gerencianet não configuradas: ${missingVars.join(', ')}`);
  console.warn('   O sistema de pagamento PIX não funcionará até que estas variáveis sejam configuradas.');
}

const certPath = process.env.GERENCIANET_PIX_CERT 
  ? path.join(__dirname, `../../certs/${process.env.GERENCIANET_PIX_CERT}.p12`)
  : null;

// Valida se o certificado existe
if (certPath && !fs.existsSync(certPath)) {
  console.warn(`⚠️  AVISO: Certificado PIX não encontrado em: ${certPath}`);
  console.warn('   Verifique se o arquivo .p12 está na pasta backend/certs/');
}

export = {
  sandbox: process.env.GERENCIANET_SANDBOX === "true",
  client_id: process.env.GERENCIANET_CLIENT_ID as string,
  client_secret: process.env.GERENCIANET_CLIENT_SECRET as string,
  pix_cert: certPath || ""
};


