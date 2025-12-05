import { toast } from "react-toastify";
import { i18n } from "../translate/i18n";
import { isString } from 'lodash';

// Mapeamento de códigos de status HTTP para mensagens amigáveis
const HTTP_ERROR_MESSAGES = {
  400: "Requisição inválida. Verifique os dados enviados.",
  401: "Sessão expirada. Por favor, faça login novamente.",
  403: "Acesso negado. Você não tem permissão para esta ação.",
  404: "Recurso não encontrado.",
  408: "Tempo de requisição esgotado. Tente novamente.",
  409: "Conflito. Este recurso já existe.",
  422: "Dados inválidos. Verifique as informações fornecidas.",
  429: "Muitas requisições. Aguarde um momento e tente novamente.",
  500: "Erro interno do servidor. Tente novamente mais tarde.",
  502: "Servidor temporariamente indisponível.",
  503: "Serviço temporariamente indisponível.",
  504: "Tempo de resposta do servidor esgotado.",
};

// Erros específicos do backend que devem ser tratados de forma especial
const SPECIFIC_ERROR_HANDLERS = {
  // Erros de rede
  "Network Error": {
    message: "Erro de conexão. Verifique sua internet e se o servidor está online.",
    type: "network",
    autoClose: 4000,
    icon: "📡"
  },
  "ERR_NETWORK": {
    message: "Erro de conexão. Verifique sua internet e se o servidor está online.",
    type: "network",
    autoClose: 4000,
    icon: "📡"
  },
  "ERR_INTERNET_DISCONNECTED": {
    message: "Sem conexão com a internet.",
    type: "network",
    autoClose: 5000,
    icon: "📡"
  },
  
  // Erros de autenticação
  "ERR_SESSION_EXPIRED": {
    message: "Sua sessão expirou. Redirecionando para login...",
    type: "auth",
    autoClose: 3000,
    icon: "🔒",
    action: () => {
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
  },
  "ERR_NO_AUTH": {
    message: "Autenticação necessária. Faça login para continuar.",
    type: "auth",
    autoClose: 3000,
    icon: "🔒"
  },
  
  // Erros de validação
  "ERR_VALIDATION": {
    message: "Dados inválidos. Verifique os campos preenchidos.",
    type: "validation",
    autoClose: 4000,
    icon: "⚠️"
  },
  
  // Erros de permissão
  "ERR_NO_PERMISSION": {
    message: "Você não tem permissão para realizar esta ação.",
    type: "permission",
    autoClose: 3000,
    icon: "🚫"
  },
  
  // Erros de recurso não encontrado
  "ERR_NOT_FOUND": {
    message: "Recurso não encontrado.",
    type: "notfound",
    autoClose: 3000,
    icon: "🔍"
  },
  
  // Erros de ticket
  "ERR_OTHER_OPEN_TICKET": {
    message: "Já existe um ticket aberto para este contato.",
    type: "ticket",
    autoClose: 4000,
    icon: "🎫"
  },
  
  // Erros genéricos
  "ERR_INTERNAL": {
    message: "Erro interno. Tente novamente mais tarde.",
    type: "internal",
    autoClose: 3000,
    icon: "❌"
  }
};

// Função para obter o tema atual (light/dark)
const getCurrentTheme = () => {
  const theme = localStorage.getItem("preferredTheme") || "light";
  return theme;
};

// Função para obter estilos responsivos baseados no tamanho da tela
const getResponsiveStyles = () => {
  const isMobile = window.innerWidth <= 768;
  const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
  
  return {
    fontSize: isMobile ? "14px" : isTablet ? "15px" : "16px",
    padding: isMobile ? "12px 16px" : "14px 20px",
    maxWidth: isMobile ? "90vw" : isTablet ? "400px" : "450px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  };
};

// Função para obter cor do toast baseado no tipo de erro
const getErrorColor = (errorType) => {
  const colors = {
    network: "#ff6b6b",
    auth: "#ffa726",
    validation: "#ffb74d",
    permission: "#ef5350",
    notfound: "#78909c",
    ticket: "#42a5f5",
    internal: "#e57373",
    default: "#f44336"
  };
  return colors[errorType] || colors.default;
};

// Função para formatar mensagem de erro
const formatErrorMessage = (error, errorType) => {
  const handler = SPECIFIC_ERROR_HANDLERS[error];
  if (handler) {
    return handler.icon ? `${handler.icon} ${handler.message}` : handler.message;
  }
  
  // Tentar tradução via i18n
  if (i18n.exists(`backendErrors.${error}`)) {
    return i18n.t(`backendErrors.${error}`);
  }
  
  // Retornar mensagem original
  return error;
};

// Função principal melhorada
const toastError = (err) => {
  // Se for string, tratar como mensagem direta
  if (isString(err)) {
    const handler = SPECIFIC_ERROR_HANDLERS[err];
    if (handler) {
      toast.error(formatErrorMessage(err, handler.type), {
        toastId: err,
        autoClose: handler.autoClose || 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          ...getResponsiveStyles(),
          backgroundColor: getCurrentTheme() === "dark" ? "#2a3942" : "#ffffff",
          color: getCurrentTheme() === "dark" ? "#e9edef" : "#111b21",
          borderLeft: `4px solid ${getErrorColor(handler.type)}`,
        },
        bodyStyle: {
          fontSize: getResponsiveStyles().fontSize,
          fontFamily: "'Segoe UI', 'Helvetica Neue', Helvetica, 'Lucida Grande', Arial, sans-serif",
        },
        progressStyle: {
          background: getErrorColor(handler.type),
        },
      });
      
      // Executar ação específica se houver
      if (handler.action) {
        handler.action();
      }
      return;
    }
    
    toast.error(err, {
      toastId: err,
      autoClose: 3000,
      style: getResponsiveStyles(),
    });
    return;
  }

  // Se for objeto de erro do Axios
  if (err?.response) {
    const status = err.response.status;
    const errorMsg = err.response?.data?.error || err.response?.data?.message;
    
    // Verificar se há handler específico para este erro
    if (errorMsg && SPECIFIC_ERROR_HANDLERS[errorMsg]) {
      const handler = SPECIFIC_ERROR_HANDLERS[errorMsg];
      toast.error(formatErrorMessage(errorMsg, handler.type), {
        toastId: errorMsg,
        autoClose: handler.autoClose || 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          ...getResponsiveStyles(),
          backgroundColor: getCurrentTheme() === "dark" ? "#2a3942" : "#ffffff",
          color: getCurrentTheme() === "dark" ? "#e9edef" : "#111b21",
          borderLeft: `4px solid ${getErrorColor(handler.type)}`,
        },
        bodyStyle: {
          fontSize: getResponsiveStyles().fontSize,
          fontFamily: "'Segoe UI', 'Helvetica Neue', Helvetica, 'Lucida Grande', Arial, sans-serif",
        },
        progressStyle: {
          background: getErrorColor(handler.type),
        },
      });
      
      if (handler.action) {
        handler.action();
      }
      return;
    }
    
    // Tratar por código de status HTTP
    if (status && HTTP_ERROR_MESSAGES[status]) {
      const message = errorMsg && i18n.exists(`backendErrors.${errorMsg}`) 
        ? i18n.t(`backendErrors.${errorMsg}`)
        : errorMsg || HTTP_ERROR_MESSAGES[status];
      
      toast.error(message, {
        toastId: `error-${status}-${errorMsg || 'generic'}`,
        autoClose: status === 401 ? 3000 : 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          ...getResponsiveStyles(),
          backgroundColor: getCurrentTheme() === "dark" ? "#2a3942" : "#ffffff",
          color: getCurrentTheme() === "dark" ? "#e9edef" : "#111b21",
          borderLeft: `4px solid ${getErrorColor("default")}`,
        },
        bodyStyle: {
          fontSize: getResponsiveStyles().fontSize,
          fontFamily: "'Segoe UI', 'Helvetica Neue', Helvetica, 'Lucida Grande', Arial, sans-serif",
        },
        progressStyle: {
          background: getErrorColor("default"),
        },
      });
      
      // Redirecionar para login se for 401
      if (status === 401 && errorMsg !== "ERR_SESSION_EXPIRED") {
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
      return;
    }
    
    // Mensagem de erro do backend (com tradução se disponível)
    if (errorMsg) {
      const message = i18n.exists(`backendErrors.${errorMsg}`)
        ? i18n.t(`backendErrors.${errorMsg}`)
        : errorMsg;
      
      toast.error(message, {
        toastId: errorMsg,
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          ...getResponsiveStyles(),
          backgroundColor: getCurrentTheme() === "dark" ? "#2a3942" : "#ffffff",
          color: getCurrentTheme() === "dark" ? "#e9edef" : "#111b21",
          borderLeft: `4px solid ${getErrorColor("default")}`,
        },
        bodyStyle: {
          fontSize: getResponsiveStyles().fontSize,
          fontFamily: "'Segoe UI', 'Helvetica Neue', Helvetica, 'Lucida Grande', Arial, sans-serif",
        },
        progressStyle: {
          background: getErrorColor("default"),
        },
      });
      return;
    }
  }

  // Erro de rede (sem resposta do servidor)
  if (err?.message === "Network Error" || err?.code === "ERR_NETWORK" || err?.code === "ERR_INTERNET_DISCONNECTED") {
    const handler = SPECIFIC_ERROR_HANDLERS[err.message] || SPECIFIC_ERROR_HANDLERS[err.code] || SPECIFIC_ERROR_HANDLERS["Network Error"];
    toast.error(formatErrorMessage(handler ? err.message || err.code : "Network Error", "network"), {
      toastId: "network-error",
      autoClose: handler?.autoClose || 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        ...getResponsiveStyles(),
        backgroundColor: getCurrentTheme() === "dark" ? "#2a3942" : "#ffffff",
        color: getCurrentTheme() === "dark" ? "#e9edef" : "#111b21",
        borderLeft: `4px solid ${getErrorColor("network")}`,
      },
      bodyStyle: {
        fontSize: getResponsiveStyles().fontSize,
        fontFamily: "'Segoe UI', 'Helvetica Neue', Helvetica, 'Lucida Grande', Arial, sans-serif",
      },
      progressStyle: {
        background: getErrorColor("network"),
      },
    });
    return;
  }

  // Erro genérico
  toast.error("Ocorreu um erro inesperado. Tente novamente.", {
    toastId: "generic-error",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: {
      ...getResponsiveStyles(),
      backgroundColor: getCurrentTheme() === "dark" ? "#2a3942" : "#ffffff",
      color: getCurrentTheme() === "dark" ? "#e9edef" : "#111b21",
      borderLeft: `4px solid ${getErrorColor("default")}`,
    },
    bodyStyle: {
      fontSize: getResponsiveStyles().fontSize,
      fontFamily: "'Segoe UI', 'Helvetica Neue', Helvetica, 'Lucida Grande', Arial, sans-serif",
    },
    progressStyle: {
      background: getErrorColor("default"),
    },
  });
};

export default toastError;
