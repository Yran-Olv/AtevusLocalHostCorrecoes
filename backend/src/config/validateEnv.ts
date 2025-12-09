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
    required: true,
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
  FRONTEND_URL: {
    required: true,
    productionOnly: true,
    description: "URL do frontend"
  }
};

export function validateEnvironment(): void {
  const isProduction = process.env.NODE_ENV === "production";
  const missingVars: string[] = [];

  for (const [varName, config] of Object.entries(requiredEnvVars)) {
    const isRequired = config.required && (!config.productionOnly || isProduction);
    
    if (isRequired && !process.env[varName]) {
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
      process.exit(1);
    } else {
      logger.warn("⚠️  Continuando em modo desenvolvimento, mas algumas funcionalidades podem não funcionar.");
    }
  } else {
    logger.info("✅ Todas as variáveis de ambiente obrigatórias estão configuradas.");
  }
}

