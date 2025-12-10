import logger from "../utils/logger";

interface RequiredEnvVars {
  [key: string]: {
    required: boolean;
    description: string;
    productionOnly?: boolean;
  };
}

const requiredEnvVars: RequiredEnvVars = {
  NODE_ENV: {
    required: false, // Não obrigatório - será inferido se vazio
    description: "Ambiente de execução (development, production, test)"
  },
  PORT: {
    required: true,
    description: "Porta do servidor"
  },
  DB_HOST: {
    required: true,
    description: "Host do banco de dados"
  },
  DB_NAME: {
    required: true,
    description: "Nome do banco de dados"
  },
  DB_USER: {
    required: true,
    description: "Usuário do banco de dados"
  },
  DB_PASS: {
    required: true,
    description: "Senha do banco de dados"
  },
  JWT_SECRET: {
    required: true,
    productionOnly: true,
    description: "Secret para JWT tokens"
  },
  JWT_REFRESH_SECRET: {
    required: true,
    productionOnly: true,
    description: "Secret para JWT refresh tokens"
  },
  FRONTEND_URL: {
    required: true,
    productionOnly: true,
    description: "URL do frontend"
  },
  BACKEND_URL: {
    required: true,
    productionOnly: true,
    description: "URL do backend"
  },
  REDIS_URI: {
    required: true,
    description: "URI de conexão do Redis"
  }
};

export function validateEnvironment(): void {
  // Normalizar NODE_ENV (tratar vazio como undefined)
  let nodeEnv = process.env.NODE_ENV?.trim();
  
  // Se NODE_ENV estiver vazio, tentar inferir baseado em outras variáveis
  if (!nodeEnv || nodeEnv === "") {
    // Tentar inferir ambiente baseado em outras variáveis
    const hasHttpsUrl = process.env.FRONTEND_URL?.includes('https://') || 
                        process.env.BACKEND_URL?.includes('https://');
    const hasProductionUrls = process.env.FRONTEND_URL?.includes('.com') || 
                              process.env.BACKEND_URL?.includes('.com');
    
    if (hasHttpsUrl || hasProductionUrls) {
      nodeEnv = "production";
      process.env.NODE_ENV = "production";
      logger.warn("⚠️  NODE_ENV estava vazio, mas foi definido como 'production' baseado nas URLs.");
    } else {
      nodeEnv = "development";
      process.env.NODE_ENV = "development";
      logger.warn("⚠️  NODE_ENV estava vazio, definido como 'development'.");
    }
  }
  
  const isProduction = nodeEnv === "production";
  const missingVars: string[] = [];

  for (const [varName, config] of Object.entries(requiredEnvVars)) {
    // NODE_ENV não é obrigatório (já foi tratado acima)
    if (varName === "NODE_ENV") {
      continue;
    }
    
    const isRequired = config.required && (!config.productionOnly || isProduction);
    const value = process.env[varName]?.trim();
    
    // Verificar se está vazio ou undefined
    if (isRequired && (!value || value === "")) {
      missingVars.push(`${varName} (${config.description})`);
    }
  }

  if (missingVars.length > 0) {
    logger.error("❌ Variáveis de ambiente obrigatórias não configuradas:");
    missingVars.forEach(varName => {
      logger.error(`   - ${varName}`);
    });
    logger.error("\n⚠️  Configure as variáveis de ambiente antes de iniciar o servidor.");
    
    if (isProduction) {
      logger.error("❌ Erro crítico em produção. Encerrando o processo.");
      process.exit(1);
    } else {
      logger.warn("⚠️  Continuando em modo desenvolvimento, mas algumas funcionalidades podem não funcionar.");
    }
  } else {
    logger.info("✅ Todas as variáveis de ambiente obrigatórias estão configuradas.");
    logger.info(`📊 Ambiente: ${process.env.NODE_ENV}`);
  }
}

