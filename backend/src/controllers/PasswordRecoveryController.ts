import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import User from "../models/User";
import PasswordRecoveryToken from "../models/PasswordRecoveryToken";
import { SendMailWithConfig } from "../helpers/SendMailWithConfig";
import crypto from "crypto";
import { Op } from "sequelize";

const sendPasswordRecoveryEmail = async (email: string, token: string) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const recoveryLink = `${frontendUrl}/reset-password?token=${token}`;
  
  try {
    await SendMailWithConfig({
      to: email,
      subject: "Recuperação de Senha - Multivus",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #128c7e; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Recuperação de Senha</h2>
            <p>Você solicitou a recuperação de senha para sua conta no Multivus.</p>
            <p>Clique no botão abaixo para redefinir sua senha:</p>
            <a href="${recoveryLink}" class="button">Redefinir Senha</a>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all;">${recoveryLink}</p>
            <p><strong>Este link expira em 1 hora.</strong></p>
            <p>Se você não solicitou esta recuperação, ignore este email.</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Multivus. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    return true;
  } catch (error) {
    console.error("Erro ao enviar email de recuperação:", error);
    // Não lança erro para não expor se o email existe
    return false;
  }
};

export const requestRecovery = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const schema = Yup.object().shape({
    email: Yup.string().email("Email inválido").required("Email é obrigatório")
  });

  try {
    await schema.validate(req.body);
  } catch (err: any) {
    throw new AppError(err.message, 400);
  }

  const { email } = req.body;

  const user = await User.findOne({
    where: { email: email.toLowerCase() }
  });

  // Sempre retorna sucesso para não expor se o email existe ou não
  if (!user) {
    return res.status(200).json({
      message: "Se o email existir, você receberá instruções para recuperar sua senha."
    });
  }

  // Remove tokens expirados do usuário
  await PasswordRecoveryToken.destroy({
    where: {
      userId: user.id,
      expiresAt: { [Op.lt]: new Date() }
    }
  });

  // Gera token de recuperação
  const recoveryToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = new Date();
  tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token válido por 1 hora

  // Salva token no banco
  await PasswordRecoveryToken.create({
    userId: user.id,
    token: recoveryToken,
    expiresAt: tokenExpiry
  });

  // Envia email
  await sendPasswordRecoveryEmail(user.email, recoveryToken);

  return res.status(200).json({
    message: "Se o email existir, você receberá instruções para recuperar sua senha."
  });
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const schema = Yup.object().shape({
    token: Yup.string().required("Token é obrigatório"),
    password: Yup.string().min(6, "Senha deve ter no mínimo 6 caracteres").required("Senha é obrigatória")
  });

  try {
    await schema.validate(req.body);
  } catch (err: any) {
    throw new AppError(err.message, 400);
  }

  const { token, password } = req.body;

  // Busca token válido
  const recoveryToken = await PasswordRecoveryToken.findOne({
    where: {
      token,
      expiresAt: { [Op.gt]: new Date() }
    }
  });

  if (!recoveryToken) {
    throw new AppError("Token inválido ou expirado", 400);
  }

  // Busca o usuário
  const user = await User.findByPk(recoveryToken.userId);
  
  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }

  // Atualiza senha do usuário
  await user.update({ password });

  // Remove o token usado
  await recoveryToken.destroy();

  return res.status(200).json({
    message: "Senha alterada com sucesso. Você já pode fazer login."
  });
};

