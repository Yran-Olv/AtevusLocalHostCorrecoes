import { WAMessage, AnyMessageContent, WAPresence } from "whaileys";
import * as Sentry from "@sentry/node";
import fs from "fs";
import { exec } from "child_process";
import path from "path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";
import mime from "mime-types";
import Contact from "../../models/Contact";
import { GetJidOf } from "./GetJidOf";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  body?: string;
}

interface RequestFlow {
  media: string;
  ticket: Ticket;
  body?: string;
  isFlow?: boolean;
  isRecord?: boolean;
}

const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");

const processAudio = async (audio: string): Promise<string> => {
  const outputAudio = `${publicFolder}/${new Date().getTime()}.opus`;
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath.path} -i ${audio} -vn -c:a libopus -b:a 128k -vbr on -compression_level 10 -ar 48000 -ac 1 -application voip ${outputAudio} -y`,
      (error, _stdout, _stderr) => {
        if (error) reject(error);
        //fs.unlinkSync(audio);
        resolve(outputAudio);
      }
    );
  });
};

const processAudioFile = async (audio: string): Promise<string> => {
  const outputAudio = `${publicFolder}/${new Date().getTime()}.opus`;
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath.path} -i ${audio} -vn -c:a libopus -b:a 128k -vbr on -compression_level 10 -ar 48000 -ac 1 -application voip ${outputAudio}`,
      (error, _stdout, _stderr) => {
        if (error) reject(error);
        //fs.unlinkSync(audio);
        resolve(outputAudio);
      }
    );
  });
};

const nameFileDiscovery = (pathMedia: string) => {
  const spliting = pathMedia.split('/')
  const first = spliting[spliting.length - 1]
  return first.split(".")[0]
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const typeSimulation = async (ticket: Ticket, presence: WAPresence) => {

  const wbot = await GetTicketWbot(ticket);

  let contact = await Contact.findOne({
    where: {
      id: ticket.contactId,
    }
  });

  let number: string;
  if (contact.number && contact.number !== "" && !ticket.isGroup) {
    number = `${contact.number}@s.whatsapp.net`;
  } else if (contact.remoteJid && contact.remoteJid !== "" && contact.remoteJid.includes("@")) {
    number = contact.remoteJid;
  } else {
    number = `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
  }

  await wbot.sendPresenceUpdate(presence, number);
  await delay(5000);
  await wbot.sendPresenceUpdate('paused', number);

}

const SendWhatsAppMediaFlow = async ({
  media,
  ticket,
  body,
  isFlow = false,
  isRecord = false
}: RequestFlow): Promise<WAMessage> => {
  try {
    const wbot = await GetTicketWbot(ticket);

    const mimetype = mime.lookup(media)
    const pathMedia = media

    const typeMessage = mimetype.split("/")[0];
    const mediaName = nameFileDiscovery(media)

    let options: AnyMessageContent;

    if (typeMessage === "video") {
      options = {
        video: fs.readFileSync(pathMedia),
        caption: body,
        fileName: mediaName
        // gifPlayback: true
      };
    } else if (typeMessage === "audio") {
      console.log('record', isRecord)
      if (isRecord) {
        const convert = await processAudio(pathMedia);
        options = {
          audio: fs.readFileSync(convert),
          mimetype: "audio/ogg; codecs=opus",
          ptt: true
        };
      } else {
        const convert = await processAudioFile(pathMedia);
        options = {
          audio: fs.readFileSync(convert),
          mimetype: "audio/ogg; codecs=opus",
          ptt: false
        };
      }
    } else if (typeMessage === "document" || typeMessage === "text") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body,
        fileName: mediaName,
        mimetype: mimetype
      };
    } else if (typeMessage === "application") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body,
        fileName: mediaName,
        mimetype: mimetype
      };
    } else {
      options = {
        image: fs.readFileSync(pathMedia),
        caption: body
      };
    }

    let contact = await Contact.findOne({
      where: {
        id: ticket.contactId,
      }
    });

    let number: string;
    if (contact.number && contact.number !== "" && !ticket.isGroup) {
      number = `${contact.number}@s.whatsapp.net`;
    } else if (contact.remoteJid && contact.remoteJid !== "" && contact.remoteJid.includes("@")) {
      number = contact.remoteJid;
    } else {
      number = `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
    }

    const sentMessage = await wbot.sendMessage(
      GetJidOf(ticket),
      {
        ...options
      }
    );

    await ticket.update({ lastMessage: mediaName });

    return sentMessage;
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMediaFlow;
