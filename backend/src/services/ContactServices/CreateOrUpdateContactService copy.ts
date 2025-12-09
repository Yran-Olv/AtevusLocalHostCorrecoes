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
    fs.chmodSync(folder, 0o777);
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
  lid
}: Request): Promise<Contact> => {
  try {
    let createContact = false;
    const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
    const number = isGroup ? rawNumber : rawNumber.replace(/[^0-9]/g, "");
    const io = getIO();
    let contact: Contact | null;

    let lidEmbeddedNumber: string | undefined;
    if (lid && lid.includes('@lid')) {
      lidEmbeddedNumber = lid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
      logger.info(`🔍 [Empresa ${companyId}] LID: ${lidEmbeddedNumber} (${lid})`);
    }

    const possibleContacts = await Contact.findAll({
      where: {
        [Op.or]: [
          { number, companyId },
          ...(lid ? [{ lid, companyId }] : []),
          ...(lidEmbeddedNumber ? [{ number: lidEmbeddedNumber, companyId }] : [])
        ]
      },
      order: [['createdAt', 'ASC']],
      limit: 50
    });

    if (possibleContacts.length > 1) {
      logger.warn(`⚠️ [Empresa ${companyId}] DUPLICATA! ${possibleContacts.length} contatos: ${possibleContacts.map(c => c.id).join(', ')}`);

      contact = possibleContacts[0];
      const duplicates = possibleContacts.slice(1);

      logger.info(`📋 [Empresa ${companyId}] Unificando ${duplicates.length} em ID ${contact.id}`);

      const MAX_IMMEDIATE_UNIFY = 10;
      const immediateUnify = duplicates.slice(0, MAX_IMMEDIATE_UNIFY);
      const deferredUnify = duplicates.slice(MAX_IMMEDIATE_UNIFY);

      if (deferredUnify.length > 0) {
        logger.warn(`⚠️ ${deferredUnify.length} duplicatas adicionais NÃO serão unificadas agora (proteção de performance)`);
        logger.info(`📋 IDs pendentes: ${deferredUnify.map(d => d.id).join(', ')}`);
      }

      for (const duplicate of immediateUnify) {
        try {
          const ticketsCount = await Ticket.count({ where: { contactId: duplicate.id } });
          const messagesCount = await Message.count({ where: { contactId: duplicate.id } });

          logger.info(`   Unificando contato ${duplicate.id}: ${ticketsCount} tickets, ${messagesCount} mensagens`);

          if (ticketsCount > 100 || messagesCount > 1000) {
            logger.warn(`   ⚠️ Contato ${duplicate.id} tem muitos dados (${ticketsCount} tickets, ${messagesCount} mensagens)`);
          }

          const unifyPromise = Promise.all([
            Ticket.update({ contactId: contact.id }, { where: { contactId: duplicate.id } }),
            Message.update({ contactId: contact.id }, { where: { contactId: duplicate.id } }),
            ContactCustomField.update({ contactId: contact.id }, { where: { contactId: duplicate.id } })
          ]);

          await Promise.race([
            unifyPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout 20s')), 20000))
          ]);

          await duplicate.destroy();

          logger.info(`   ✅ Contato ${duplicate.id} unificado e removido`);
        } catch (error) {
          logger.error(`   ❌ Erro ao unificar contato ${duplicate.id}: ${error.message}`);
          logger.warn(`   ⚠️ Duplicata ${duplicate.id} mantida temporariamente`);
          Sentry.captureException(error);
        }
      }

      logger.info(`✅ Unificação completa! ${immediateUnify.length} processadas`);
    }
    else if (possibleContacts.length === 1) {
      contact = possibleContacts[0];

      if (lidEmbeddedNumber && contact.number === lidEmbeddedNumber) {
        logger.info(`✅ Contato antigo encontrado! ID: ${contact.id}, atualizando para JID: ${number}`);
      }
    }
    else {
      contact = null;
    }

    if (!contact && possibleContacts.length > 0) {
      logger.error('⚠️ FALLBACK: usando primeiro contato encontrado');
      contact = possibleContacts[0];
    }

    let updateImage = (!contact || contact?.profilePicUrl !== profilePicUrl && profilePicUrl !== "") && wbot || false;

    if (contact) {
      contact.remoteJid = remoteJid;
      contact.profilePicUrl = profilePicUrl || null;
      contact.isGroup = isGroup;

      if (contact.number !== number && lidEmbeddedNumber && contact.number === lidEmbeddedNumber) {
        if (number !== lidEmbeddedNumber) {
          const oldNumber = contact.number;
          contact.number = number;
          logger.info(`✅ Número atualizado! ID: ${contact.id}, de "${oldNumber}" para "${number}"`);
        }
      }

      if (lid && !contact.lid) {
        contact.lid = lid;
        logger.info(`LID adicionado ao contato ${contact.id}: ${lid}`);
      }

      if (contact.name === contact.number && name && name !== contact.number) {
        contact.name = name;
        logger.info(`Nome atualizado para contato ${contact.id}: "${name}"`);
      }

      if (isNil(contact.whatsappId)) {
        const whatsapp = await Whatsapp.findOne({
          where: { id: whatsappId, companyId }
        });

        if (whatsapp) {
          contact.whatsappId = whatsappId;
        }
      }
      const folder = path.resolve(publicFolder, `company${companyId}`, "contacts");

      let fileName, oldPath = "";
      if (contact.urlPicture) {
        // Normalizar caminho para funcionar em Windows e Linux
        const normalizedPath = contact.urlPicture.replace(/\\/g, '/');
        oldPath = path.resolve(normalizedPath);
        // Usar path.basename ao invés de split('\\').pop() para cross-platform
        fileName = path.join(folder, path.basename(normalizedPath));
      }
      if (!fs.existsSync(fileName) || contact.profilePicUrl === "") {
        if (wbot && ['whatsapp'].includes(channel)) {
          try {
            profilePicUrl = await wbot.profilePictureUrl(remoteJid, "image");
          } catch (e) {
            Sentry.captureException(e);
            profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
          }
          contact.profilePicUrl = profilePicUrl;
          updateImage = true;
        }
      }

      if (contact.name === number) {
        contact.name = name;
      }

      await contact.save();
      await contact.reload();

    } else if (wbot && ['whatsapp'].includes(channel)) {
      const settings = await CompaniesSettings.findOne({ where: { companyId } });
      const { acceptAudioMessageContact } = settings;
      let newRemoteJid = remoteJid;

      if (!remoteJid && remoteJid !== "") {
        newRemoteJid = isGroup ? `${rawNumber}@g.us` : `${rawNumber}@s.whatsapp.net`;
      }

      try {
        profilePicUrl = await wbot.profilePictureUrl(remoteJid, "image");
      } catch (e) {
        Sentry.captureException(e);
        profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
      }

      try {
        contact = await Contact.create({
          name,
          number,
          email,
          isGroup,
          companyId,
          channel,
          acceptAudioMessage: acceptAudioMessageContact === 'enabled' ? true : false,
          remoteJid: newRemoteJid,
          profilePicUrl,
          urlPicture: "",
          whatsappId,
          lid
        });
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          logger.warn(`Duplicate key ao criar contato ${number}, buscando novamente...`);
          contact = await Contact.findOne({
            where: {
              [Op.or]: [
                { number, companyId },
                ...(lid ? [{ lid, companyId }] : [])
              ]
            }
          });

          if (contact) {
            contact.remoteJid = newRemoteJid;
            contact.profilePicUrl = profilePicUrl;
            if (lid && !contact.lid) {
              contact.lid = lid;
              logger.info(`LID adicionado ao contato ${contact.id}: ${lid}`);
            }
            if (contact.name === number) {
              contact.name = name;
            }
            await contact.save();
            await contact.reload();
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }

      createContact = true;
    } else if (['facebook', 'instagram'].includes(channel)) {
      contact = await Contact.create({
        name,
        number,
        email,
        isGroup,
        companyId,
        channel,
        profilePicUrl,
        urlPicture: "",
        whatsappId,
        lid
      });
    }

    if (updateImage) {
      try {
        const filename = await downloadProfileImage({
          profilePicUrl,
          companyId,
          contact
        });

        const urlPicture = filename === "nopicture.png"
          ? `${process.env.FRONTEND_URL}/nopicture.png`
          : filename;

        await contact.update({
          urlPicture: filename,
          pictureUpdated: true
        });

        await contact.reload();
      } catch (error) {
        logger.error("Error downloading profile image:", error);
        Sentry.captureException(error);

        await contact.update({
          urlPicture: `${process.env.FRONTEND_URL}/nopicture.png`,
          pictureUpdated: true
        });
      }
    } else if (['facebook', 'instagram'].includes(channel)) {
      try {
        const filename = await downloadProfileImage({
          profilePicUrl,
          companyId,
          contact
        });

        const urlPicture = filename === "nopicture.png"
          ? `${process.env.FRONTEND_URL}/nopicture.png`
          : filename;

        await contact.update({
          urlPicture: filename,
          pictureUpdated: true
        });

        await contact.reload();
      } catch (error) {
        logger.error("Error downloading social media profile image:", error);
        Sentry.captureException(error);

        await contact.update({
          urlPicture: `${process.env.FRONTEND_URL}/nopicture.png`,
          pictureUpdated: true
        });
      }
    }

    if (createContact) {
      io.of(String(companyId))
        .emit(`company-${companyId}-contact`, {
          action: "create",
          contact
        });
    } else {
      io.of(String(companyId))
        .emit(`company-${companyId}-contact`, {
          action: "update",
          contact
        });
    }

    return contact;
  } catch (err) {
    logger.error("Error to find or create a contact:", err);
    Sentry.captureException(err);
    throw err;
  }
};

export default CreateOrUpdateContactService;
