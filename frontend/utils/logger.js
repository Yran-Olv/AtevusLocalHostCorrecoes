/**
 * Logger utilitário que só loga em desenvolvimento
 * Remove automaticamente logs em produção
 */

const isDevelopment = process.env.NODE_ENV === 'development';

const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    // Erros sempre devem ser logados, mas em produção podem ir para um serviço de monitoramento
    if (isDevelopment) {
      console.error(...args);
    } else {
      // Em produção, enviar para serviço de monitoramento (ex: Sentry)
      // Sentry.captureException(new Error(args.join(' ')));
    }
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  table: (data) => {
    if (isDevelopment) {
      console.table(data);
    }
  },
  
  group: (label) => {
    if (isDevelopment) {
      console.group(label);
    }
  },
  
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  }
};

export default logger;

