import path from "path";
import fs from "fs";
import GerencianetConfig from "../models/GerencianetConfig";

// Função para obter configurações do banco ou fallback para .env
export const getGerencianetOptions = async () => {
  try {
    const config = await GerencianetConfig.findOne();
    
    if (config && config.clientId && config.clientSecret) {
      // Usa configuração do banco
      const certPath = config.pixCert 
        ? path.join(__dirname, `../../certs/${config.pixCert}.p12`)
        : null;

      // Valida se o certificado existe
      if (certPath && !fs.existsSync(certPath)) {
        console.warn(`⚠️  AVISO: Certificado PIX não encontrado em: ${certPath}`);
        console.warn('   Verifique se o arquivo .p12 está na pasta backend/certs/');
      }

      return {
        sandbox: config.sandbox,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        pix_cert: certPath || ""
      };
    }
  } catch (error) {
    console.warn("⚠️  Erro ao buscar configuração do Gerencianet do banco:", error);
  }

  // Fallback para variáveis de ambiente
  const certPath = process.env.GERENCIANET_PIX_CERT 
    ? path.join(__dirname, `../../certs/${process.env.GERENCIANET_PIX_CERT}.p12`)
    : null;

  // Valida se o certificado existe
  if (certPath && !fs.existsSync(certPath)) {
    console.warn(`⚠️  AVISO: Certificado PIX não encontrado em: ${certPath}`);
    console.warn('   Verifique se o arquivo .p12 está na pasta backend/certs/');
  }

  return {
    sandbox: process.env.GERENCIANET_SANDBOX === "true",
    client_id: process.env.GERENCIANET_CLIENT_ID as string,
    client_secret: process.env.GERENCIANET_CLIENT_SECRET as string,
    pix_cert: certPath || ""
  };
};

// Exportação padrão para compatibilidade (usa .env)
// Para usar configuração do banco, use getGerencianetOptions() em vez de importar options
const defaultOptions = {
  sandbox: process.env.GERENCIANET_SANDBOX === "true",
  client_id: process.env.GERENCIANET_CLIENT_ID as string,
  client_secret: process.env.GERENCIANET_CLIENT_SECRET as string,
  pix_cert: process.env.GERENCIANET_PIX_CERT 
    ? path.join(__dirname, `../../certs/${process.env.GERENCIANET_PIX_CERT}.p12`)
    : ""
};

export default defaultOptions;


