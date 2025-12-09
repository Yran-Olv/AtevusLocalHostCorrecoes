import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";

type TokenPayload = {
  token: string | undefined;
};

const envTokenAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { token: bodyToken } = req.body as TokenPayload;
    const { token: queryToken } = req.query as TokenPayload;

    // Em desenvolvimento, permitir sem token se ENV_TOKEN não estiver configurado
    if (process.env.NODE_ENV !== 'production' && !process.env.ENV_TOKEN) {
      return next();
    }

    // Verificar token na query string
    if (queryToken === process.env.ENV_TOKEN) {
      return next();
    }

    // Verificar token no body
    if (bodyToken === process.env.ENV_TOKEN) {
      return next();
    }

    // Se ENV_TOKEN não estiver configurado, permitir em desenvolvimento
    if (!process.env.ENV_TOKEN && process.env.NODE_ENV !== 'production') {
      return next();
    }

  } catch (e) {
    console.log("Erro em envTokenAuth:", e);
    // Em desenvolvimento, permitir mesmo com erro
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }
  }

  throw new AppError("Token inválido", 403);
};

export default envTokenAuth;