import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import LoginConfig from "../models/LoginConfig";
import isSuper from "../middleware/isSuper";

interface LoginConfigData {
  typingTexts?: string | string[];
  mailPass?: string;
  [key: string]: any;
}

// Temas pré-definidos
const PREDEFINED_THEMES = {
  default: {
    name: "Padrão",
    primaryColor: "#128c7e",
    secondaryColor: "#25d366",
    backgroundImageUrl: "",
    typingTexts: [
      "Melhor sistema para atendimento via WhatsApp",
      "Gerencie sua empresa com inteligência",
      "Atendimento eficiente e organizado"
    ]
  },
  natalino: {
    name: "Natalino",
    primaryColor: "#c41e3a",
    secondaryColor: "#228b22",
    backgroundImageUrl: "",
    typingTexts: [
      "Feliz Natal! Sistema de atendimento completo",
      "Celebre o fim de ano com eficiência",
      "Boas festas e muito sucesso!"
    ]
  },
  anoNovo: {
    name: "Ano Novo",
    primaryColor: "#ffd700",
    secondaryColor: "#000000",
    backgroundImageUrl: "",
    typingTexts: [
      "Feliz Ano Novo! Novos desafios, novas conquistas",
      "Comece o ano com o melhor sistema",
      "Sucesso e prosperidade em 2025!"
    ]
  },
  diaMulher: {
    name: "Dia da Mulher",
    primaryColor: "#ff69b4",
    secondaryColor: "#ff1493",
    backgroundImageUrl: "",
    typingTexts: [
      "Dia Internacional da Mulher",
      "Celebrando a força e determinação",
      "Mulheres que transformam o mundo"
    ]
  },
  diaMaes: {
    name: "Dia das Mães",
    primaryColor: "#ff69b4",
    secondaryColor: "#ffb6c1",
    backgroundImageUrl: "",
    typingTexts: [
      "Dia das Mães - Homenagem especial",
      "Mães que inspiram e transformam",
      "Amor incondicional e dedicação"
    ]
  },
  conscienciaNegra: {
    name: "Consciência Negra",
    primaryColor: "#000000",
    secondaryColor: "#ffd700",
    backgroundImageUrl: "",
    typingTexts: [
      "Dia da Consciência Negra",
      "Respeito, igualdade e diversidade",
      "Celebrando a cultura e história"
    ]
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

  // Não retorna senha de email completa por segurança
  if (configData.mailPass && !configData.mailPass.startsWith("***")) {
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
  const schema = Yup.object().shape({
    theme: Yup.string(),
    logoUrl: Yup.string().url("URL inválida"),
    backgroundImageUrl: Yup.string().url("URL inválida"),
    title: Yup.string(),
    subtitle: Yup.string(),
    typingTexts: Yup.mixed(),
    primaryColor: Yup.string(),
    secondaryColor: Yup.string(),
    enableTypingEffect: Yup.boolean(),
    enableAnimations: Yup.boolean(),
    enablePasswordRecovery: Yup.boolean(),
    customCss: Yup.string(),
    welcomeMessage: Yup.string(),
    mailHost: Yup.string(),
    mailPort: Yup.number().min(1).max(65535),
    mailUser: Yup.string(),
    mailPass: Yup.string(),
    mailFrom: Yup.string(),
    mailSecure: Yup.boolean()
  });

  try {
    await schema.validate(req.body);
  } catch (err: any) {
    throw new AppError(err.message, 400);
  }

  // Validação adicional de email se campos de email foram preenchidos
  if (req.body.mailHost || req.body.mailUser || req.body.mailFrom) {
    if (req.body.mailUser && !req.body.mailUser.includes("@")) {
      throw new AppError("Email do usuário SMTP inválido", 400);
    }
    if (req.body.mailFrom && !req.body.mailFrom.includes("@")) {
      throw new AppError("Email remetente inválido", 400);
    }
  }

  let config = await LoginConfig.findOne();

  const updateData = { ...req.body };

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
  }

  // Se mailPass não foi enviado ou está mascarado, mantém o atual
  if (!updateData.mailPass || updateData.mailPass.startsWith("***")) {
    delete updateData.mailPass;
  }

  if (!config) {
    config = await LoginConfig.create(updateData);
  } else {
    await config.update(updateData);
  }

  const configData: LoginConfigData = config.toJSON() as LoginConfigData;
  if (typeof configData.typingTexts === 'string') {
    try {
      configData.typingTexts = JSON.parse(configData.typingTexts);
    } catch {
      configData.typingTexts = [];
    }
  }

  // Não retorna senha de email completa por segurança
  if (configData.mailPass && !configData.mailPass.startsWith("***")) {
    configData.mailPass = "***" + configData.mailPass.slice(-4);
  }

  return res.status(200).json(configData);
};

