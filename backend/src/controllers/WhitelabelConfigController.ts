import { Request, Response } from "express";
import WhitelabelConfig from "../models/WhitelabelConfig";
import AppError from "../errors/AppError";

export const index = async (req: Request, res: Response): Promise<Response> => {
  let config = await WhitelabelConfig.findOne();

  // Se não existe, cria uma configuração padrão
  if (!config) {
    config = await WhitelabelConfig.create({});
  }

  return res.status(200).json(config);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const {
    sidebarBg,
    sidebarText,
    sidebarTextActive,
    sidebarActiveBorder,
    navbarBg,
    navbarText,
    pageBgLight,
    pageBgDark,
    cardBgLight,
    cardBgDark,
    textPrimaryLight,
    textPrimaryDark,
    textSecondaryLight,
    textSecondaryDark,
    primaryColor,
    secondaryColor,
    fontFamily,
    fontSizeBase,
    fontWeightNormal,
    fontWeightBold,
    appLogoLight,
    appLogoDark,
    appLogoFavicon,
    appName
  } = req.body;

  let config = await WhitelabelConfig.findOne();

  if (!config) {
    config = await WhitelabelConfig.create({});
  }

  // Atualiza apenas os campos fornecidos
  if (sidebarBg !== undefined) config.sidebarBg = sidebarBg;
  if (sidebarText !== undefined) config.sidebarText = sidebarText;
  if (sidebarTextActive !== undefined) config.sidebarTextActive = sidebarTextActive;
  if (sidebarActiveBorder !== undefined) config.sidebarActiveBorder = sidebarActiveBorder;
  if (navbarBg !== undefined) config.navbarBg = navbarBg;
  if (navbarText !== undefined) config.navbarText = navbarText;
  if (pageBgLight !== undefined) config.pageBgLight = pageBgLight;
  if (pageBgDark !== undefined) config.pageBgDark = pageBgDark;
  if (cardBgLight !== undefined) config.cardBgLight = cardBgLight;
  if (cardBgDark !== undefined) config.cardBgDark = cardBgDark;
  if (textPrimaryLight !== undefined) config.textPrimaryLight = textPrimaryLight;
  if (textPrimaryDark !== undefined) config.textPrimaryDark = textPrimaryDark;
  if (textSecondaryLight !== undefined) config.textSecondaryLight = textSecondaryLight;
  if (textSecondaryDark !== undefined) config.textSecondaryDark = textSecondaryDark;
  if (primaryColor !== undefined) config.primaryColor = primaryColor;
  if (secondaryColor !== undefined) config.secondaryColor = secondaryColor;
  if (fontFamily !== undefined) config.fontFamily = fontFamily;
  if (fontSizeBase !== undefined) config.fontSizeBase = fontSizeBase;
  if (fontWeightNormal !== undefined) config.fontWeightNormal = fontWeightNormal;
  if (fontWeightBold !== undefined) config.fontWeightBold = fontWeightBold;
  if (appLogoLight !== undefined) config.appLogoLight = appLogoLight;
  if (appLogoDark !== undefined) config.appLogoDark = appLogoDark;
  if (appLogoFavicon !== undefined) config.appLogoFavicon = appLogoFavicon;
  if (appName !== undefined) config.appName = appName;

  await config.save();

  return res.status(200).json(config);
};

export const reset = async (req: Request, res: Response): Promise<Response> => {
  let config = await WhitelabelConfig.findOne();

  if (!config) {
    config = await WhitelabelConfig.create({});
  } else {
    // Reseta para valores padrão
    await config.update({
      sidebarBg: "#1a1d29",
      sidebarText: "#e4e6eb",
      sidebarTextActive: "#ffffff",
      sidebarActiveBorder: "#25d366",
      navbarBg: "#128c7e",
      navbarText: "#ffffff",
      pageBgLight: "#f8f9fa",
      pageBgDark: "#0f1117",
      cardBgLight: "#ffffff",
      cardBgDark: "#1a1d29",
      textPrimaryLight: "#1a1a1a",
      textPrimaryDark: "#e4e6eb",
      textSecondaryLight: "#4a5568",
      textSecondaryDark: "#b0b3b8",
      primaryColor: "#128c7e",
      secondaryColor: "#25d366",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSizeBase: 16,
      fontWeightNormal: 400,
      fontWeightBold: 600
    });
  }

  return res.status(200).json(config);
};

