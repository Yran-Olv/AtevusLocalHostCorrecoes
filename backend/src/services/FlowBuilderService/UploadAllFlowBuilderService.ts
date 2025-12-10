import { FlowAudioModel } from "../../models/FlowAudio";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import { FlowImgModel } from "../../models/FlowImg";
import { WebhookModel } from "../../models/Webhook";
import { randomString } from "../../utils/randomCode";
import logger from "../../utils/logger";
import AppError from "../../errors/AppError";

interface Request {
  userId: number;
  medias: Express.Multer.File[];
  companyId: number;
}

const UploadAllFlowBuilderService = async ({
  userId,
  medias,
  companyId
}: Request): Promise<string[]> => {
  try {
    let itemsNewNames: string[] = [];
    for (let i = 0; medias.length > i; i++) {
      let nameFile = medias[i].filename;
      //if (medias[i].filename.split(".").length === 1) {
      //  nameFile = medias[i].filename + "." + medias[i].mimetype.split("/")[1];
      //}
      itemsNewNames = [...itemsNewNames, nameFile]
      if (
        medias[i].mimetype.split("/")[1] === "png" ||
        medias[i].mimetype.split("/")[1] === "jpg" ||
        medias[i].mimetype.split("/")[1] === "jpeg"
      ) {
        await FlowImgModel.create({
          userId: userId,
          companyId: companyId,
          name: nameFile
        });
        
      }
      if (
        medias[i].mimetype.split("/")[1] === "mp3" ||
        medias[i].mimetype.split("/")[1] === "ogg" ||
        medias[i].mimetype.split("/")[1] === "mp4" ||
        medias[i].mimetype.split("/")[1] === "mpeg"
      ) {
        
        if(medias[i].mimetype.split("/")[1] === "mpeg"){
          nameFile = nameFile.split('.')[0] + '.mp3'
        }

        await FlowAudioModel.create({
          userId: userId,
          companyId: companyId,
          name: nameFile
        });
        
      }
    }

    logger.info('Mídias do fluxo criadas', { userId, companyId, count: itemsNewNames.length });
    return itemsNewNames;
  } catch (error) {
    logger.error("Erro ao criar mídias do fluxo", {
      userId,
      companyId,
      mediasCount: medias.length,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    throw new AppError('Erro ao criar mídias do fluxo');
  }
};

export default UploadAllFlowBuilderService;
