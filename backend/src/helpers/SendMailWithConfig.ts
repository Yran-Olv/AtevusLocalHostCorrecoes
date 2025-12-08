import nodemailer from "nodemailer";
import LoginConfig from "../models/LoginConfig";

export interface MailData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function SendMailWithConfig(mailData: MailData) {
  // Busca configuração de email do banco
  const loginConfig = await LoginConfig.findOne();
  
  // Usa configuração do banco se disponível, senão usa .env
  const mailHost = loginConfig?.mailHost || process.env.MAIL_HOST;
  const mailPort = loginConfig?.mailPort || parseInt(process.env.MAIL_PORT || "587");
  const mailUser = loginConfig?.mailUser || process.env.MAIL_USER;
  const mailPass = loginConfig?.mailPass || process.env.MAIL_PASS;
  const mailFrom = loginConfig?.mailFrom || process.env.MAIL_FROM;
  const mailSecure = loginConfig?.mailSecure !== undefined ? loginConfig.mailSecure : (process.env.MAIL_SECURE === "true");

  // Se não há configuração nem no banco nem no .env, lança erro
  if ((!loginConfig?.mailHost && !process.env.MAIL_HOST) || 
      (!loginConfig?.mailUser && !process.env.MAIL_USER) || 
      (!loginConfig?.mailPass && !process.env.MAIL_PASS) || 
      (!loginConfig?.mailFrom && !process.env.MAIL_FROM)) {
    throw new Error("Configuração de email incompleta. Configure em Settings → Tela Login → Configurações de Email ou nas variáveis de ambiente (.env)");
  }

  const options: any = {
    host: mailHost,
    port: mailPort,
    secure: mailSecure,
    auth: {
      user: mailUser,
      pass: mailPass
    }
  };

  const transporter = nodemailer.createTransport(options);

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: mailFrom,
    to: mailData.to,
    subject: mailData.subject,
    text: mailData.text,
    html: mailData.html || mailData.text
  });

  console.log("Message sent: %s", info.messageId);
  
  // Preview only available when sending through an Ethereal account
  if (nodemailer.getTestMessageUrl) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("Preview URL: %s", previewUrl);
    }
  }

  return info;
}

