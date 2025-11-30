import { Chat, Contact } from "whaileys";
import Baileys from "../../models/Baileys";

interface Request {
  whatsappId: number;
  contacts?: Contact[];
  chats?: Chat[];
}

const createOrUpdateBaileysService = async ({
  whatsappId,
  contacts,
  chats,
}: Request): Promise<Baileys> => {

  try {
    const baileysExists = await Baileys.findOne({
      where: { whatsappId }
    });

    if (baileysExists) {
      let getChats: Chat[] = [];
      let getContacts: Contact[] = [];

      // Converte/normaliza CHATS existentes (aceita string JSON ou objeto)
      if (baileysExists.chats) {
        try {
          if (typeof baileysExists.chats === 'string') {
            getChats = JSON.parse(baileysExists.chats);
          } else {
            // Já veio como objeto/array do DB (JSON/JSONB)
            getChats = baileysExists.chats as unknown as Chat[];
          }
        } catch (err) {
          console.warn(`Chats JSON inválido, substituindo por []`);
          getChats = [];
        }
      }

      // Converte/normaliza CONTATOS existentes (aceita string JSON ou objeto)
      if (baileysExists.contacts) {
        try {
          if (typeof baileysExists.contacts === 'string') {
            getContacts = JSON.parse(baileysExists.contacts);
          } else {
            getContacts = baileysExists.contacts as unknown as Contact[];
          }
        } catch (err) {
          console.warn(`Contacts JSON inválido, substituindo por []`);
          getContacts = [];
        }
      }

      if (chats) {
        getChats.push(...chats);
        getChats.sort();
        const newChats = getChats.filter((v: Chat, i: number, a: Chat[]) => a.findIndex(v2 => (v2.id === v.id)) === i)

        return await baileysExists.update({
          chats: JSON.stringify(newChats),
        });
      }

      if (contacts) {
        getContacts.push(...contacts);
        getContacts.sort();
        const newContacts = getContacts.filter((v: Contact, i: number, a: Contact[]) => a.findIndex(v2 => (v2.id === v.id)) === i)

        return await baileysExists.update({
          contacts: JSON.stringify(newContacts),
        });
      }

    }

    const baileys = await Baileys.create({
      whatsappId,
      contacts: JSON.stringify(contacts),
      chats: JSON.stringify(chats)
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    return baileys;
  } catch (error) {
    console.log(error, whatsappId, contacts);
    throw new Error(error);
  }
};

export default createOrUpdateBaileysService;