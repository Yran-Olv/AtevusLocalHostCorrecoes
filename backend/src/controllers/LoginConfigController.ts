import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import LoginConfig from "../models/LoginConfig";
import isSuper from "../middleware/isSuper";
import path from "path";

interface LoginConfigData {
  typingTexts?: string | string[];
  mailPass?: string;
  [key: string]: any;
}

// Temas pré-definidos brasileiros com layouts diferentes
const PREDEFINED_THEMES = {
  default: {
    name: "Padrão",
    description: "Tema corporativo WhatsApp",
    primaryColor: "#128c7e",
    secondaryColor: "#25d366",
    backgroundGradient: "linear-gradient(135deg, #128c7e 0%, #075e54 50%, #0a4d3e 100%)",
    backgroundImageUrl: "",
    layout: "split", // split, centered, full-width
    typingTexts: [
      "Melhor sistema para atendimento via WhatsApp",
      "Gerencie sua empresa com inteligência",
      "Atendimento eficiente e organizado"
    ],
    icon: "💬"
  },
  natalino: {
    name: "Natalino",
    description: "Celebre o Natal com estilo",
    primaryColor: "#c41e3a",
    secondaryColor: "#228b22",
    backgroundGradient: "linear-gradient(135deg, #c41e3a 0%, #8b0000 50%, #228b22 100%)",
    backgroundImageUrl: "",
    layout: "centered",
    typingTexts: [
      "Feliz Natal! Sistema de atendimento completo",
      "Celebre o fim de ano com eficiência",
      "Boas festas e muito sucesso!"
    ],
    icon: "🎄",
    decorations: ["❄️", "🎁", "⭐"]
  },
  anoNovo: {
    name: "Ano Novo",
    description: "Comece o ano com energia",
    primaryColor: "#ffd700",
    secondaryColor: "#000000",
    backgroundGradient: "linear-gradient(135deg, #ffd700 0%, #ff8c00 50%, #000000 100%)",
    backgroundImageUrl: "",
    layout: "full-width",
    typingTexts: [
      "Feliz Ano Novo! Novos desafios, novas conquistas",
      "Comece o ano com o melhor sistema",
      "Sucesso e prosperidade em 2025!"
    ],
    icon: "🎆",
    decorations: ["🎊", "🥂", "⭐"]
  },
  diaMulher: {
    name: "Dia da Mulher",
    description: "Rosa, flores e empoderamento",
    primaryColor: "#ff69b4",
    secondaryColor: "#ff1493",
    backgroundGradient: "linear-gradient(135deg, #ffb6c1 0%, #ff69b4 50%, #ff1493 100%)",
    backgroundImageUrl: "",
    layout: "split",
    typingTexts: [
      "Dia Internacional da Mulher",
      "Celebrando a força e determinação",
      "Mulheres que transformam o mundo"
    ],
    icon: "🌹",
    decorations: ["🌸", "💐", "🌺"]
  },
  diaMaes: {
    name: "Dia das Mães",
    description: "Homenagem especial às mães",
    primaryColor: "#ff69b4",
    secondaryColor: "#ffb6c1",
    backgroundGradient: "linear-gradient(135deg, #ffe4e1 0%, #ffb6c1 50%, #ff69b4 100%)",
    backgroundImageUrl: "",
    layout: "centered",
    typingTexts: [
      "Dia das Mães - Homenagem especial",
      "Mães que inspiram e transformam",
      "Amor incondicional e dedicação"
    ],
    icon: "💐",
    decorations: ["🌷", "🌻", "💝"]
  },
  conscienciaNegra: {
    name: "Consciência Negra",
    description: "Respeito e diversidade",
    primaryColor: "#000000",
    secondaryColor: "#ffd700",
    backgroundGradient: "linear-gradient(135deg, #1a1a1a 0%, #000000 50%, #ffd700 100%)",
    backgroundImageUrl: "",
    layout: "split",
    typingTexts: [
      "Dia da Consciência Negra",
      "Respeito, igualdade e diversidade",
      "Celebrando a cultura e história"
    ],
    icon: "✊",
    decorations: ["⭐", "🌟", "💫"]
  },
  independencia: {
    name: "Independência do Brasil",
    description: "7 de Setembro - Orgulho nacional",
    primaryColor: "#009739",
    secondaryColor: "#ffdf00",
    backgroundGradient: "linear-gradient(135deg, #009739 0%, #ffdf00 50%, #002776 100%)",
    backgroundImageUrl: "",
    layout: "full-width",
    typingTexts: [
      "Independência do Brasil",
      "Orgulho de ser brasileiro",
      "Liberdade e soberania"
    ],
    icon: "🇧🇷",
    decorations: ["⭐", "🎆", "🏛️"]
  },
  carnaval: {
    name: "Carnaval",
    description: "A maior festa do Brasil",
    primaryColor: "#ff0080",
    secondaryColor: "#00ff80",
    backgroundGradient: "linear-gradient(135deg, #ff0080 0%, #ff8000 50%, #00ff80 100%)",
    backgroundImageUrl: "",
    layout: "centered",
    typingTexts: [
      "Carnaval brasileiro",
      "Alegria e festa",
      "Celebre com estilo"
    ],
    icon: "🎭",
    decorations: ["🎪", "🎊", "🎉"]
  },
  pascoa: {
    name: "Páscoa",
    description: "Renovação e esperança",
    primaryColor: "#8b4513",
    secondaryColor: "#ffd700",
    backgroundGradient: "linear-gradient(135deg, #f0e68c 0%, #ffd700 50%, #8b4513 100%)",
    backgroundImageUrl: "",
    layout: "split",
    typingTexts: [
      "Feliz Páscoa!",
      "Renovação e esperança",
      "Celebre com alegria"
    ],
    icon: "🐰",
    decorations: ["🥚", "🐣", "🌷"]
  },
  junina: {
    name: "Festa Junina",
    description: "São João brasileiro",
    primaryColor: "#ff8c00",
    secondaryColor: "#ffd700",
    backgroundGradient: "linear-gradient(135deg, #ff8c00 0%, #ffd700 50%, #ff4500 100%)",
    backgroundImageUrl: "",
    layout: "centered",
    typingTexts: [
      "Festa Junina",
      "Tradição e alegria",
      "São João brasileiro"
    ],
    icon: "🎆",
    decorations: ["🌽", "🎪", "🔥"]
  },
  diaPais: {
    name: "Dia dos Pais",
    description: "Homenagem aos pais",
    primaryColor: "#4169e1",
    secondaryColor: "#87ceeb",
    backgroundGradient: "linear-gradient(135deg, #4169e1 0%, #87ceeb 50%, #1e90ff 100%)",
    backgroundImageUrl: "",
    layout: "split",
    typingTexts: [
      "Dia dos Pais",
      "Homenagem especial",
      "Amor e dedicação"
    ],
    icon: "👔",
    decorations: ["🎁", "⭐", "💙"]
  },
  diaCriancas: {
    name: "Dia das Crianças",
    description: "12 de Outubro",
    primaryColor: "#ff69b4",
    secondaryColor: "#87ceeb",
    backgroundGradient: "linear-gradient(135deg, #ffb6c1 0%, #ff69b4 50%, #87ceeb 100%)",
    backgroundImageUrl: "",
    layout: "centered",
    typingTexts: [
      "Dia das Crianças",
      "Alegria e diversão",
      "Celebre a infância"
    ],
    icon: "🎈",
    decorations: ["🎨", "🎪", "🎁"]
  }
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  let config = await LoginConfig.findOne();

  // Se não existe, cria uma configuração padrão
  if (!config) {
    const defaultTheme = PREDEFINED_THEMES.default;
    config = await LoginConfig.create({
      theme: "default",
      title: "Multivus",
      subtitle: "Sistema de Multiatendimento",
      typingTexts: JSON.stringify(defaultTheme.typingTexts),
      primaryColor: defaultTheme.primaryColor,
      secondaryColor: defaultTheme.secondaryColor,
      enableTypingEffect: true,
      enableAnimations: true,
      enablePasswordRecovery: true,
      welcomeMessage: "Bem-vindo ao sistema de atendimento",
      mailHost: process.env.MAIL_HOST || "",
      mailPort: parseInt(process.env.MAIL_PORT || "587"),
      mailUser: process.env.MAIL_USER || "",
      mailPass: process.env.MAIL_PASS || "",
      mailFrom: process.env.MAIL_FROM || "",
      mailSecure: process.env.MAIL_SECURE === "true"
    });
  }

  // Parse typingTexts se for string
  const configData: LoginConfigData = config.toJSON() as LoginConfigData;
  if (typeof configData.typingTexts === 'string') {
    try {
      configData.typingTexts = JSON.parse(configData.typingTexts);
    } catch {
      configData.typingTexts = [];
    }
  }

  // Parse teamImages se for string
  if (configData.teamImages && typeof configData.teamImages === 'string') {
    try {
      configData.teamImages = JSON.parse(configData.teamImages);
    } catch {
      configData.teamImages = [];
    }
  }

  // Não retorna senha de email completa por segurança
  if (configData.mailPass && typeof configData.mailPass === 'string' && !configData.mailPass.startsWith("***")) {
    configData.mailPass = "***" + configData.mailPass.slice(-4);
  }

  return res.status(200).json(configData);
};

export const getThemes = async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).json(PREDEFINED_THEMES);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const schema = Yup.object().shape({
    theme: Yup.string(),
    logoUrl: Yup.string().nullable().test(
      "url-validation",
      "URL do logo inválida. Deve ser uma URL válida (ex: https://exemplo.com/logo.png)",
      function(value) {
        if (!value || value === "") return true;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }
    ),
    backgroundImageUrl: Yup.string().nullable().test(
      "url-validation",
      "URL da imagem de fundo inválida. Deve ser uma URL válida (ex: https://exemplo.com/fundo.jpg)",
      function(value) {
        if (!value || value === "") return true;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }
    ),
    title: Yup.string().max(100, "O título deve ter no máximo 100 caracteres"),
    subtitle: Yup.string().max(200, "O subtítulo deve ter no máximo 200 caracteres"),
    typingTexts: Yup.mixed().test(
      "array-validation",
      "Textos de digitação devem ser um array",
      function(value) {
        if (!value) return true;
        return Array.isArray(value);
      }
    ),
    primaryColor: Yup.string().nullable().test(
      "color-validation",
      "Cor primária inválida. Use formato hexadecimal (ex: #128c7e)",
      function(value) {
        if (!value || value === "") return true;
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
      }
    ),
    secondaryColor: Yup.string().nullable().test(
      "color-validation",
      "Cor secundária inválida. Use formato hexadecimal (ex: #25d366)",
      function(value) {
        if (!value || value === "") return true;
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
      }
    ),
    enableTypingEffect: Yup.boolean(),
    enableAnimations: Yup.boolean(),
    enablePasswordRecovery: Yup.boolean(),
    customCss: Yup.string(),
    welcomeMessage: Yup.string().max(500, "A mensagem de boas-vindas deve ter no máximo 500 caracteres"),
    teamImages: Yup.mixed().test(
      "array-validation",
      "Imagens da equipe devem ser um array",
      function(value) {
        if (!value) return true;
        return Array.isArray(value);
      }
    ),
    mailHost: Yup.string().test(
      "email-config-validation",
      "Servidor SMTP é obrigatório quando email está configurado",
      function(value) {
        const { mailUser, mailPort, mailFrom } = this.parent;
        const hasAnyEmailField = (mailUser && mailUser.length > 0) || 
                                 (mailPort && mailPort > 0) || 
                                 (mailFrom && mailFrom.length > 0) ||
                                 (value && value.length > 0);
        
        if (hasAnyEmailField && (!value || value.trim() === "")) {
          return false;
        }
        return true;
      }
    ),
    mailPort: Yup.number()
      .min(1, "Porta SMTP deve ser maior que 0")
      .max(65535, "Porta SMTP deve ser menor que 65536")
      .test(
        "email-config-validation",
        "Porta SMTP é obrigatória quando email está configurado",
        function(value) {
          const { mailHost, mailUser, mailFrom } = this.parent;
          const hasAnyEmailField = (mailHost && mailHost.length > 0) || 
                                   (mailUser && mailUser.length > 0) || 
                                   (mailFrom && mailFrom.length > 0) ||
                                   (value && value > 0);
          
          if (hasAnyEmailField && (!value || isNaN(value))) {
            return false;
          }
          return true;
        }
      ),
    mailUser: Yup.string()
      .email("Email do usuário SMTP inválido")
      .test(
        "email-config-validation",
        "Usuário SMTP é obrigatório quando email está configurado",
        function(value) {
          const { mailHost, mailPort, mailFrom } = this.parent;
          const hasAnyEmailField = (mailHost && mailHost.length > 0) || 
                                   (mailPort && mailPort > 0) || 
                                   (mailFrom && mailFrom.length > 0) ||
                                   (value && value.length > 0);
          
          if (hasAnyEmailField && (!value || value.trim() === "")) {
            return false;
          }
          return true;
        }
      ),
    mailPass: Yup.string().test(
      "email-config-validation",
      "Senha SMTP é obrigatória quando email está configurado",
      function(value) {
        const { mailHost, mailUser, mailPort, mailFrom } = this.parent;
        const hasAnyEmailField = (mailHost && mailHost.length > 0) || 
                                 (mailUser && mailUser.length > 0) || 
                                 (mailPort && mailPort > 0) ||
                                 (mailFrom && mailFrom.length > 0);
        
        if (hasAnyEmailField) {
          // Se mailPass está mascarado (começa com ***), será verificado depois na lógica de negócio
          if (!value || (typeof value === 'string' && value.startsWith("***"))) {
            return true; // Será validado na lógica de negócio
          }
        }
        return true;
      }
    ),
    mailFrom: Yup.string()
      .email("Email remetente inválido")
      .test(
        "email-config-validation",
        "Email remetente é obrigatório quando email está configurado",
        function(value) {
          const { mailHost, mailUser, mailPort } = this.parent;
          const hasAnyEmailField = (mailHost && mailHost.length > 0) || 
                                   (mailUser && mailUser.length > 0) || 
                                   (mailPort && mailPort > 0) ||
                                   (value && value.length > 0);
          
          if (hasAnyEmailField && (!value || value.trim() === "")) {
            return false;
          }
          return true;
        }
      ),
    mailSecure: Yup.boolean()
  });

  try {
    await schema.validate(req.body, { abortEarly: false });
  } catch (err: any) {
    // Se for erro de validação do Yup, retorna detalhes dos campos
    if (err.inner && err.inner.length > 0) {
      const errors = err.inner.map((error: any) => ({
        field: error.path,
        message: error.message
      }));
      
      return res.status(400).json({
        message: "Erro de validação. Verifique os campos abaixo:",
        errors: errors,
        fields: errors.map((e: any) => e.field)
      });
    }
    
    throw new AppError(err.message || "Erro ao validar dados", 400);
  }

  // Validação adicional de email se campos de email foram preenchidos
  const emailFields = [req.body.mailHost, req.body.mailUser, req.body.mailFrom];
  const hasEmailConfig = emailFields.some(field => field && field.length > 0);
  
  if (hasEmailConfig) {
    const missingFields: string[] = [];
    
    if (!req.body.mailHost || req.body.mailHost.trim() === "") {
      missingFields.push("Servidor SMTP (mailHost)");
    }
    if (!req.body.mailPort || isNaN(req.body.mailPort)) {
      missingFields.push("Porta SMTP (mailPort)");
    }
    if (!req.body.mailUser || req.body.mailUser.trim() === "") {
      missingFields.push("Usuário/Email SMTP (mailUser)");
    }
    if (!req.body.mailPass || (typeof req.body.mailPass === 'string' && req.body.mailPass.startsWith("***"))) {
      // Se a senha está mascarada, precisa ser reenviada
      const currentConfig = await LoginConfig.findOne();
      if (!currentConfig || !currentConfig.mailPass) {
        missingFields.push("Senha SMTP (mailPass)");
      }
    }
    if (!req.body.mailFrom || req.body.mailFrom.trim() === "") {
      missingFields.push("Email Remetente (mailFrom)");
    }
    
    if (missingFields.length > 0) {
      // Mapear nomes de campos para os nomes corretos
      const fieldMap: { [key: string]: string } = {
        "servidorsmtpmailhost": "mailHost",
        "portasmtpmailport": "mailPort",
        "usuário/emailsmtpmailuser": "mailUser",
        "senhasmtpmailpass": "mailPass",
        "emailremetentemailfrom": "mailFrom"
      };
      
      const errors = missingFields.map(field => {
        const fieldKey = field.toLowerCase().replace(/[()]/g, "").replace(/\s+/g, "").replace(/\//g, "");
        // Mapear baseado no conteúdo do campo
        let mappedField = "mailHost";
        if (fieldKey.includes("porta")) mappedField = "mailPort";
        else if (fieldKey.includes("usuário") || fieldKey.includes("user")) mappedField = "mailUser";
        else if (fieldKey.includes("senha") || fieldKey.includes("pass")) mappedField = "mailPass";
        else if (fieldKey.includes("remetente") || fieldKey.includes("from")) mappedField = "mailFrom";
        else if (fieldKey.includes("servidor") || fieldKey.includes("host")) mappedField = "mailHost";
        
        return {
          field: mappedField,
          message: `${field} é obrigatório`
        };
      });
      
      return res.status(400).json({
        message: "Para configurar email, todos os campos são obrigatórios:",
        errors: errors,
        fields: errors.map((e: any) => e.field)
      });
    }
    
    if (req.body.mailUser && !req.body.mailUser.includes("@")) {
      return res.status(400).json({
        message: "Email do usuário SMTP inválido",
        errors: [{ field: "mailUser", message: "Email do usuário SMTP deve conter @" }],
        fields: ["mailUser"]
      });
    }
    if (req.body.mailFrom && !req.body.mailFrom.includes("@")) {
      return res.status(400).json({
        message: "Email remetente inválido",
        errors: [{ field: "mailFrom", message: "Email remetente deve conter @" }],
        fields: ["mailFrom"]
      });
    }
  }

  let config = await LoginConfig.findOne();

  const updateData: any = { ...req.body };

  // Remove campos undefined para evitar problemas no banco
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  });

  // Se um tema pré-definido foi selecionado, aplica suas configurações
  if (updateData.theme && PREDEFINED_THEMES[updateData.theme as keyof typeof PREDEFINED_THEMES]) {
    const themeConfig = PREDEFINED_THEMES[updateData.theme as keyof typeof PREDEFINED_THEMES];
    updateData.primaryColor = updateData.primaryColor || themeConfig.primaryColor;
    updateData.secondaryColor = updateData.secondaryColor || themeConfig.secondaryColor;
    if (!updateData.typingTexts || (Array.isArray(updateData.typingTexts) && updateData.typingTexts.length === 0)) {
      updateData.typingTexts = themeConfig.typingTexts;
    }
  }

  // Converte typingTexts para JSON se for array
  if (Array.isArray(updateData.typingTexts)) {
    updateData.typingTexts = JSON.stringify(updateData.typingTexts);
  } else if (updateData.typingTexts === null || updateData.typingTexts === undefined) {
    // Se não foi enviado, mantém o atual ou usa array vazio
    if (config && config.typingTexts) {
      delete updateData.typingTexts; // Mantém o atual
    } else {
      updateData.typingTexts = JSON.stringify([]);
    }
  }

  // Converte teamImages para JSON se for array
  if (Array.isArray(updateData.teamImages)) {
    updateData.teamImages = JSON.stringify(updateData.teamImages);
  } else if (updateData.teamImages === null || updateData.teamImages === undefined) {
    // Se não foi enviado, mantém o atual ou usa array vazio
    if (config && config.teamImages) {
      delete updateData.teamImages; // Mantém o atual
    } else {
      updateData.teamImages = JSON.stringify([]);
    }
  }

  // Se mailPass não foi enviado ou está mascarado, mantém o atual
  if (!updateData.mailPass || (typeof updateData.mailPass === 'string' && updateData.mailPass.startsWith("***"))) {
    delete updateData.mailPass;
  }

  try {
    if (!config) {
      config = await LoginConfig.create(updateData);
    } else {
      await config.update(updateData);
    }
  } catch (dbError: any) {
    console.error('Erro ao salvar LoginConfig:', dbError);
    throw new AppError(
      `Erro ao salvar configuração: ${dbError.message || 'Erro desconhecido'}`,
      500
    );
  }

  const configData: LoginConfigData = config.toJSON() as LoginConfigData;
  if (typeof configData.typingTexts === 'string') {
    try {
      configData.typingTexts = JSON.parse(configData.typingTexts);
    } catch {
      configData.typingTexts = [];
    }
  }

  // Parse teamImages se for string
  if (configData.teamImages && typeof configData.teamImages === 'string') {
    try {
      configData.teamImages = JSON.parse(configData.teamImages);
    } catch {
      configData.teamImages = [];
    }
  }

  // Não retorna senha de email completa por segurança
  if (configData.mailPass && typeof configData.mailPass === 'string' && !configData.mailPass.startsWith("***")) {
    configData.mailPass = "***" + configData.mailPass.slice(-4);
  }

  return res.status(200).json(configData);
  } catch (error: any) {
    console.error('Erro completo no update do LoginConfig:', error);
    console.error('Stack trace:', error.stack);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    
    // Se já foi enviada uma resposta, não enviar outra
    if (res.headersSent) {
      return res;
    }
    
    // Se for um AppError, retorna com o status code apropriado
    if (error instanceof AppError) {
      return res.status(error.statusCode || 500).json({
        message: error.message,
        errors: error.message ? [{ field: 'general', message: error.message }] : [],
        fields: []
      });
    }
    
    // Erro genérico
    return res.status(500).json({
      message: error.message || "Erro interno do servidor ao salvar configuração",
      errors: [{ field: 'general', message: error.message || "Erro desconhecido" }],
      fields: []
    });
  }
};

export const uploadImage = async (req: Request, res: Response): Promise<Response> => {
  const file = req.file;
  const { type } = req.body; // 'logo', 'background', 'team'

  if (!file) {
    throw new AppError("Nenhum arquivo enviado", 400);
  }

  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8080}`;
  let fileUrl = `${backendUrl}/public/${file.filename}`;
  
  // Se typeArch for "login", o arquivo pode estar em uma subpasta
  const { typeArch } = req.body;
  if (typeArch === "login") {
    const { companyId } = req.user;
    if (companyId) {
      fileUrl = `${backendUrl}/public/company${companyId}/login/${file.filename}`;
    } else {
      fileUrl = `${backendUrl}/public/${file.filename}`;
    }
  }

  // Se for imagem da equipe, atualiza o array de teamImages
  if (type === "team") {
    let config = await LoginConfig.findOne();
    if (!config) {
      config = await LoginConfig.create({});
    }

    let teamImages: string[] = [];
    if (config.teamImages) {
      try {
        teamImages = JSON.parse(config.teamImages);
      } catch {
        teamImages = [];
      }
    }

    if (teamImages.length >= 8) {
      throw new AppError("Máximo de 8 fotos da equipe permitidas", 400);
    }

    teamImages.push(fileUrl);
    await config.update({ teamImages: JSON.stringify(teamImages) });
  }

  return res.status(200).json({
    url: fileUrl,
    filename: file.filename,
    type
  });
};

