import { getIO } from "../../libs/socket";
import CompaniesSettings from "../../models/CompaniesSettings";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import fs from "fs";
import path, { join } from "path";
import logger from "../../utils/logger";
import { isNil } from "lodash";
import Whatsapp from "../../models/Whatsapp";
import * as Sentry from "@sentry/node";
import axios from 'axios';
import { Op } from "sequelize";
import { verifyTypeMessage } from "../WbotServices/wbotMessageListener";

interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  isGroup: boolean;
  email?: string;
  profilePicUrl?: string;
  companyId: number;
  channel?: string;
  extraInfo?: ExtraInfo[];
  remoteJid?: string;
  whatsappId?: number;
  wbot?: any;
  lid?: string;
  whatsappLid?: string;
}

const downloadProfileImage = async ({
  profilePicUrl,
  companyId,
  contact
}) => {
  const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
  const folder = path.resolve(publicFolder, `company${companyId}`, "contacts");

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
    // Em produção, usar permissões mais restritivas (0o755)
    try {
      const permissions = process.env.NODE_ENV === 'production' ? 0o755 : 0o777;
      fs.chmodSync(folder, permissions);
    } catch (chmodError) {
      // Ignorar erro de chmod no Windows
      if (process.platform !== 'win32') {
        console.warn('Erro ao definir permissões:', chmodError);
      }
    }
  }

  if (profilePicUrl.includes("nopicture.png")) {
    return "nopicture.png";
  }

  try {
    const response = await axios.get(profilePicUrl, {
      responseType: 'arraybuffer',
      timeout: 5000
    });

    const filename = `${new Date().getTime()}.jpeg`;
    const filePath = join(folder, filename);

    fs.writeFileSync(filePath, response.data);
    return filename;

  } catch (error) {
    console.error("Profile image download failed:", error.message);
    Sentry.captureException(error);
    return "nopicture.png";
  }
};

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  profilePicUrl,
  isGroup,
  email = "",
  channel = "whatsapp",
  companyId,
  extraInfo = [],
  remoteJid = "",
  whatsappId,
  wbot,
  lid,
  whatsappLid

}: Request): Promise<Contact> => {
  try {
    const io = getIO();

    // Ajusta número conforme tipo
    let number = rawNumber;


    if (verifyTypeMessage(rawNumber) === "group") {
      number = rawNumber
    }

    if (verifyTypeMessage(rawNumber) === "lid") {
      number = whatsappLid;
    }

    if (verifyTypeMessage(rawNumber) === "jid") {
      number = rawNumber.replace(/\D/g, "");
    }

    // Busca contato por número ou whatsappLid (evita dois findOne separados)
    let contact = await Contact.findOne({
      where: {
        number,
        companyId,
        channel
      }
    }) ?? (whatsappLid
      ? await Contact.findOne({
        where: {
          number: whatsappLid,
          companyId,
          channel
        }
      })
      : null);

    if (contact) {
      // Atualiza apenas campos necessários
      await contact.update({
        number,
        lid: whatsappLid,
        profilePicUrl
      });

      io.emit(`company-${companyId}-contact`, {
        action: "update",
        contact
      });
    } else {
      // Cria novo contato
      contact = await Contact.create({
        name,
        number,
        profilePicUrl,
        email,
        isGroup,
        extraInfo,
        companyId,
        channel,
        lid: whatsappLid,
      });

      io.emit(`company-${companyId}-contact`, {
        action: "create",
        contact
      });
    }

    return contact;

  } catch (error) {
    logger.error(
      `CreateOrUpdateContactService error: ${error.message}`
    );
    Sentry.captureException(error);
    throw new Error(error.message);
  }
};

export default CreateOrUpdateContactService;
