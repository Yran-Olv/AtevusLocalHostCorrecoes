import { WASocket } from "whaileys";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";


type Session = WASocket & {
  id?: number;
};

interface IOnWhatsapp {
  jid: string;
  exists: boolean;
  lid: string;
}

const checker = async (number: string, wbot: Session) => {
  const jid = number.includes("@") ? number : `${number}@s.whatsapp.net`;
  const [validNumber] = await wbot.onWhatsApp(jid);

  return {
    jid: validNumber.jid,
    exists: !!validNumber.exists,
    lid: (validNumber.lid as string) || null
  };
};

const CheckContactNumber = async (number: string, companyId: number): Promise<IOnWhatsapp> => {

  const defaultWhatsapp = await GetDefaultWhatsApp(null, companyId);

  const wbot = getWbot(defaultWhatsapp.id);
  const isNumberExit = await checker(number, wbot);

  if (!isNumberExit?.exists) {
    throw new Error("ERR_CHECK_NUMBER");
  }

  return isNumberExit;
};

export default CheckContactNumber;
