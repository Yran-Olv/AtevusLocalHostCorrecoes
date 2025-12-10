import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack
} from "@mui/material";
import { Close as CloseIcon, Delete as DeleteIcon } from "@mui/icons-material";
import Compressor from "compressorjs";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import {
  AccessTime,
  AddCircle,
  Image,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Message,
  MicNone,
  Videocam
} from "@mui/icons-material";
import { capitalize } from "../../utils/capitalize";

import "./FlowBuilderSingleBlockModal.css";

const FlowBuilderSingleBlockModal = ({
  open,
  onSave,
  onUpdate,
  data,
  close
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isMounted = useRef(true);

  const [activeModal, setActiveModal] = useState(false);

  const [rule, setRule] = useState();

  const [medias, setMedias] = useState([]);

  const [textDig, setTextDig] = useState();

  const [elements, setElements] = useState([]);

  const [elementsSeq, setElementsSeq] = useState([]);

  const [elementsSeqEdit, setElementsSeqEdit] = useState([]);

  const [elementsEdit, setElementsEdit] = useState([]);

  const [numberMessages, setNumberMessages] = useState(0);

  const [numberMessagesLast, setNumberMessagesLast] = useState(0);

  const [numberInterval, setNumberInterval] = useState(0);

  const [numberIntervalLast, setNumberIntervalLast] = useState(0);

  const [numberAudio, setNumberAudio] = useState(0);

  const [numberAudioLast, setNumberAudioLast] = useState(0);

  const [numberVideo, setNumberVideo] = useState(0);

  const [numberVideoLast, setNumberVideoLast] = useState(0);

  const [numberImg, setNumberImg] = useState(0);

  const [numberImgLast, setNumberImgLast] = useState(0);

  const [loading, setLoading] = useState(false);

  const [previewImg, setPreviewImg] = useState([]);

  const [previewAudios, setPreviewAudios] = useState([]);

  const [previewVideos, setPreviewVideos] = useState([]);

  const [arrayOption, setArrayOption] = useState([]);

  const [labels, setLabels] = useState({
    title: "Adicionar conteúdo ao fluxo",
    btn: "Adicionar"
  });

  const handleElements = newNameFiles => {
    let elementsSequence = [];

    const newArrMessage = elementsSeq.filter(item => item.includes("message"));
    const newArrInterval = elementsSeq.filter(item =>
      item.includes("interval")
    );
    const newArrImg = elementsSeq.filter(item => item.includes("img"));
    const newArrAudio = elementsSeq.filter(item => item.includes("audio"));
    const newArrVideo = elementsSeq.filter(item => item.includes("video"));

    //Todas as mensagens
    for (let i = 0; i < numberMessages; i++) {
      const value = document
        .querySelector(`.${newArrMessage[i]}`)
        .querySelector(".MuiInputBase-input").value;
      if (!value) {
        toast.error("Campos de mensagem vazio!");
        setLoading(false);
        throw "";
      }
      elementsSequence.push({
        type: "message",
        value: value,
        number: newArrMessage[i]
      });
      console.log('text')
    }
    //Todos os intervalos
    for (let i = 0; i < numberInterval; i++) {
      const value = document
        .querySelector(`.${newArrInterval[i]}`)
        .querySelector(".MuiInputBase-input").value;
      if (parseInt(value) === 0 || parseInt(value) > 120) {
        toast.error("Intervalo não pode ser 0 ou maior que 120!");
        setLoading(false);
        throw "";
      }
      elementsSequence.push({
        type: "interval",
        value: value,
        number: newArrInterval[i]
      });
      console.log('int')
    }

    //Todas as imagens
    for (let i = 0; i < numberImg; i++) {
      const onlyImg =
        newNameFiles !== null &&
        newNameFiles.filter(
          file =>
            file.includes("png") ||
            file.includes("jpg") ||
            file.includes("jpeg")
        );
      const onlyImgNameOriginal = medias.filter(
        file =>
          file.name.includes("png") ||
          file.name.includes("jpg") ||
          file.name.includes("jpeg")
      );      
      if (elementsSeqEdit.includes(newArrImg[i])) {
        const itemSelectedEdit = elementsEdit.filter(
          item => item.number === newArrImg[i]
        )[0];
        elementsSequence.push({
          type: "img",
          value: itemSelectedEdit.value,
          original: itemSelectedEdit.original,
          number: itemSelectedEdit.number
        });
      } else {
        let indexElem = 0;
        if (elementsSeqEdit.filter(item => item.includes("img")).length > 0) {
          indexElem =
            elementsSeqEdit.filter(item => item.includes("img")).length - i;
        } else {
          indexElem = i;
        }
        elementsSequence.push({
          type: "img",
          value: onlyImg[indexElem],
          original: onlyImgNameOriginal[indexElem].name,
          number: newArrImg[i]
        });
      }
    }
    //Todos os audios
    for (let i = 0; i < numberAudio; i++) {
      const onlyAudio =
        newNameFiles !== null &&
        newNameFiles.filter(
          file =>
            file.includes("mp3") ||
            file.includes("ogg") ||
            file.includes("mpeg") ||
            file.includes("opus")
        );
      const onlyAudioNameOriginal = medias.filter(
        file =>
          file.name.includes("mp3") ||
          file.name.includes("ogg") ||
          file.name.includes("mpeg") ||
          file.name.includes("opus")
      );
      
      if (elementsSeqEdit.includes(newArrAudio[i])) {
        const itemSelectedEdit = elementsEdit.filter(
          item => item.number === newArrAudio[i]
        )[0];
        elementsSequence.push({
          type: "audio",
          value: itemSelectedEdit.value,
          original: itemSelectedEdit.original,
          number: itemSelectedEdit.number,
          record: document.querySelector(`.check${newArrAudio[i]}`).querySelector(".PrivateSwitchBase-input").checked
        });
      } else {
        let indexElem = 0;
        if (elementsSeqEdit.filter(item => item.includes("audio")).length > 0) {
          indexElem =
            elementsSeqEdit.filter(item => item.includes("audio")).length - i;
        } else {
          indexElem = i;
        }
        elementsSequence.push({
          type: "audio",
          value: onlyAudio[indexElem],
          original: onlyAudioNameOriginal[indexElem].name,
          number: newArrAudio[i],
          record: document.querySelector(`.check${newArrAudio[i]}`).querySelector(".PrivateSwitchBase-input").checked
        });        
      }
    }
    //Todos os videos
    for (let i = 0; i < numberVideo; i++) {
      const onlyVideo =
        newNameFiles !== null &&
        newNameFiles.filter(
          file => file.includes("mp4") || file.includes("avi")
        );
      const onlyVideoNameOriginal = medias.filter(
        file => file.name.includes("mp4") || file.name.includes("avi")
      );
      if (elementsSeqEdit.includes(newArrVideo[i])) {
        const itemSelectedEdit = elementsEdit.filter(
          item => item.number === newArrVideo[i]
        )[0];
        elementsSequence.push({
          type: "video",
          value: itemSelectedEdit.value,
          original: itemSelectedEdit.original,
          number: itemSelectedEdit.number
        });
      } else {
        let indexElem = 0;
        if (elementsSeqEdit.filter(item => item.includes("video")).length > 0) {
          indexElem =
            elementsSeqEdit.filter(item => item.includes("video")).length - i;
        } else {
          indexElem = i;
        }
        elementsSequence.push({
          type: "video",
          value: onlyVideo[indexElem],
          original: onlyVideoNameOriginal[indexElem].name,
          number: newArrVideo[i]
        });
      }
    }

    console.log(elementsSequence)

    return elementsSequence;
  };

  const deleteElementsTypeOne = (id, type) => {
    if (type === "message") {
      setNumberMessages(old => old - 1);
      setElementsSeq(old => old.filter(item => item !== `message${id}`));
      setElementsSeqEdit(old => old.filter(item => item !== `message${id}`))
      document.querySelector(`.stackMessage${id}`).remove();
    }
    if (type === "interval") {
      setNumberInterval(old => old - 1);
      setElementsSeq(old => old.filter(item => item !== `interval${id}`));
      setElementsSeqEdit(old => old.filter(item => item !== `interval${id}`))
      document.querySelector(`.stackInterval${id}`).remove();
    }
    if (type === "img") {
      setNumberImg(old => old - 1);
      setPreviewImg(old => {
        setMedias(oldMedia => {
          try {
            return oldMedia.filter(
              mediaItem =>
                mediaItem.name !==
                old.filter(item => item.number === id)[0].name
            );
          } catch (e) {
            return oldMedia;
          }
        });
        return old.filter(item => item.number !== id);
      });
      setElementsSeq(old => old.filter(item => item !== `img${id}`));
      setElementsSeqEdit(old => old.filter(item => item !== `img${id}`))
      document.querySelector(`.stackImg${id}`).remove();
    }
    if (type === "audio") {
      setNumberAudio(old => old - 1);
      setPreviewAudios(old => {
        setMedias(oldMedia => {
          try {
            return oldMedia.filter(
              mediaItem =>
                mediaItem.name !==
                old.filter(item => item.number === id)[0].name
            );
          } catch (e) {
            return oldMedia;
          }
        });
        return old.filter(item => item.number !== id);
      });
      setElementsSeq(old => old.filter(item => item !== `audio${id}`));
      setElementsSeqEdit(old => old.filter(item => item !== `audio${id}`))
      document.querySelector(`.stackAudio${id}`).remove();
    }
    if (type === "video") {
      setNumberVideo(old => old - 1);
      setPreviewVideos(old => {
        setMedias(oldMedia => {
          try {
            return oldMedia.filter(
              mediaItem =>
                mediaItem.name !==
                old.filter(item => item.number === id)[0].name
            );
          } catch (e) {
            return oldMedia;
          }
        });
        return old.filter(item => item.number !== id);
      });
      setElementsSeq(old => old.filter(item => item !== `video${id}`));
      setElementsSeqEdit(old => old.filter(item => item !== `video${id}`))
      document.querySelector(`.stackVideo${id}`).remove();
    }
  };

  const moveElementDown = id => {
    setElementsSeq(old => {
      const array = old;
      const index = array.indexOf(id);
      moveItemParaFrente(index);
      console.log("id", id);
      if (index !== -1 && index < array.length - 1) {
        // Verifica se o elemento foi encontrado no array e não está na última posição
        const novoArray = [...array]; // Cria uma cópia do array original
        const elementoMovido = novoArray.splice(index, 1)[0];
        novoArray.splice(index + 1, 0, elementoMovido);
        return novoArray;
      }
      return array;
    });
  };

  const moveElementUp = id => {
    setElementsSeq(old => {
      const array = old;
      const index = array.indexOf(id);
      moveItemParaTras(index);

      if (index !== -1 && index > 0) {
        // Verifica se o elemento foi encontrado no array e não está na primeira posição
        const novoArray = [...array]; // Cria uma cópia do array original
        const elementoMovido = novoArray.splice(index, 1)[0];
        novoArray.splice(index - 1, 0, elementoMovido);
        return novoArray;
      }
      return array;
    });
  };

  function moveItemParaFrente(posicao) {
    setElements(old => {
      const array = old;

      if (posicao >= 0 && posicao < array.length - 1) {
        const novoArray = [...array]; // Cria uma cópia do array original
        const elementoMovido = novoArray.splice(posicao, 1)[0];
        novoArray.splice(posicao + 1, 0, elementoMovido);
        return novoArray;
      }

      return array; // Retorna o array original se a movimentação não for possível
    });
  }

  function moveItemParaTras(posicao) {
    setElements(old => {
      const array = old;
      if (posicao > 0 && posicao < array.length) {
        const novoArray = [...array]; // Cria uma cópia do array original
        const elementoMovido = novoArray.splice(posicao, 1)[0];
        novoArray.splice(posicao - 1, 0, elementoMovido);
        return novoArray;
      }

      return array; // Retorna o array original se a movimentação não for possível
    });
  }

  const handleChangeMediasImg = (e, number) => {
    if (!e.target.files) {
      return;
    }

    if (e.target.files[0].size > 2000000) {
      toast.error("Arquivo é muito grande! 2MB máximo");
      return;
    }
    const imgBlob = URL.createObjectURL(e.target.files[0]);
    setPreviewImg(old => [
      ...old,
      {
        number: number,
        url: imgBlob,
        name: e.target.files[0].name
      }
    ]);
    const selectedMedias = Array.from(e.target.files);
    setMedias(old => [...old, selectedMedias[0]]);

    document.querySelector(`.img${number}`).src = imgBlob;
    document.querySelector(`.btnImg${number}`).remove();
  };

  const handleChangeAudios = (e, number) => {
    if (!e.target.files) {
      return;
    }

    if (e.target.files[0].size > 5000000) {
      toast.error("Arquivo é muito grande! 5MB máximo");
      return;
    }

    const audioBlob = URL.createObjectURL(e.target.files[0]);
    setPreviewAudios(old => [
      ...old,
      {
        number: number,
        url: audioBlob,
        name: e.target.files[0].name
      }
    ]);

    const selectedMedias = Array.from(e.target.files);
    setMedias(old => [...old, selectedMedias[0]]);

    document.querySelector(
      `.audio${number}`
    ).innerHTML = `<audio controls="controls">
    <source src="${audioBlob}" type="audio/mp3" />
    seu navegador não suporta HTML5
  </audio>`;
    document.querySelector(`.btnAudio${number}`).remove();
  };

  const handleChangeVideos = (e, number) => {
    if (!e.target.files) {
      return;
    }

    if (e.target.files[0].size > 20000000) {
      toast.error("Arquivo é muito grande! 20MB máximo");
      return;
    }
    const videoBlob = URL.createObjectURL(e.target.files[0]);
    setPreviewVideos(old => [
      ...old,
      {
        number: number,
        url: videoBlob,
        name: e.target.files[0].name
      }
    ]);

    var divConteudo = document.createElement("div");

    const selectedMedias = Array.from(e.target.files);
    setMedias(old => [...old, selectedMedias[0]]);

    divConteudo.innerHTML = `<video controls="controls" style="width: 200px;">
    <source src="${videoBlob}" type="video/mp4" />
    seu navegador não suporta HTML5
  </video>`;

    document.querySelector(`.video${number}`).appendChild(divConteudo);
    document.querySelector(`.btnVideo${number}`).remove();
  };

  const imgLayout = (number, valueDefault = "") => {
    return (
      <Stack
        sx={{
          border: "2px solid",
          borderColor: "primary.main",
          borderRadius: 2,
          padding: 2,
          position: "relative",
          backgroundColor: "background.paper",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: 2,
            borderColor: "primary.dark"
          }
        }}
        className={`stackImg${number}`}
        key={`stackImg${number}`}
      >
        <IconButton
          sx={{ 
            position: "absolute", 
            right: 8, 
            top: 8,
            color: "error.main",
            "&:hover": {
              backgroundColor: "error.light",
              color: "error.dark"
            }
          }}
          onClick={() => deleteElementsTypeOne(number, "img")}
          size="small"
        >
          <DeleteIcon />
        </IconButton>
        <Typography textAlign="center" variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Imagem
        </Typography>
        <Stack direction="row" justifyContent="center" sx={{ mb: 1 }}>
          <Box
            component="img"
            src={
              valueDefault.length > 0
                ? process.env.REACT_APP_BACKEND_URL + "/public/" + valueDefault
                : ""
            }
            className={`img${number}`}
            sx={{ 
              maxWidth: isMobile ? '100%' : '200px',
              maxHeight: isMobile ? '200px' : 'auto',
              borderRadius: 1,
              objectFit: 'contain'
            }}
          />
        </Stack>
        {valueDefault.length === 0 && (
          <Button
            variant="contained"
            component="label"
            className={`btnImg${number}`}
            fullWidth={isMobile}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Enviar imagem
            <input
              type="file"
              accept="image/png, image/jpg, image/jpeg"
              hidden
              onChange={e => handleChangeMediasImg(e, number)}
            />
          </Button>
        )}
      </Stack>
    );
  };

  const audioLayout = (number, valueDefault = "", valueRecordDefault = "") => {
    return (
      <Stack
        sx={{
          border: "2px solid",
          borderColor: "primary.main",
          borderRadius: 2,
          padding: 2,
          position: "relative",
          backgroundColor: "background.paper",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: 2,
            borderColor: "primary.dark"
          }
        }}
        className={`stackAudio${number}`}
        key={`stackAudio${number}`}
      >
        <Stack
          sx={{ position: "absolute", right: 6 }}
          direction={"row"}
          gap={1}
        >
          {/* <KeyboardArrowUp
            onClick={() => moveElementUp(`audio${number}`)}
            sx={{ cursor: "pointer" }}
          />
          <KeyboardArrowDown
            onClick={() => moveElementDown(`audio${number}`)}
            sx={{ cursor: "pointer" }}
          /> */}
          <IconButton
            sx={{ 
              color: "error.main",
              "&:hover": {
                backgroundColor: "error.light",
                color: "error.dark"
              }
            }}
            onClick={() => deleteElementsTypeOne(number, "audio")}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
        <Typography textAlign="center" variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Áudio
        </Typography>
        <div
          className={`audio${number}`}
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center"
          }}
        >
          {valueDefault.length > 0 && (
            <audio controls="controls">
              <source
                src={
                  process.env.REACT_APP_BACKEND_URL + "/public/" + valueDefault
                }
                type="audio/mp3"
              />
              seu navegador não suporta HTML5
            </audio>
          )}
        </div>
        {valueDefault.length === 0 && (
          <Button
            variant="contained"
            component="label"
            className={`btnAudio${number}`}
            fullWidth={isMobile}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Enviar áudio
            <input
              type="file"
              accept="audio/ogg, audio/mp3, audio/opus, audio/mpeg, audio/wav"
              hidden
              onChange={e => handleChangeAudios(e, number)}
            />
          </Button>
        )}
        <Stack direction={"row"} justifyContent={"center"}>
          <Checkbox
            className={`checkaudio${number}`}
            defaultChecked={valueRecordDefault === "ok" ? false : true}
          />
          <Stack justifyContent={"center"}>
            <Typography>Enviar como audio gravado na hora</Typography>
          </Stack>
        </Stack>
      </Stack>
    );
  };

  const videoLayout = (number, valueDefault = "") => {
    return (
      <Stack
        sx={{
          border: "2px solid",
          borderColor: "primary.main",
          borderRadius: 2,
          padding: 2,
          position: "relative",
          backgroundColor: "background.paper",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: 2,
            borderColor: "primary.dark"
          }
        }}
        className={`stackVideo${number}`}
        key={`stackVideo${number}`}
      >
        <IconButton
          sx={{ 
            position: "absolute", 
            right: 8, 
            top: 8,
            color: "error.main",
            "&:hover": {
              backgroundColor: "error.light",
              color: "error.dark"
            }
          }}
          onClick={() => deleteElementsTypeOne(number, "video")}
          size="small"
        >
          <DeleteIcon />
        </IconButton>
        <Typography textAlign="center" variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Vídeo
        </Typography>
        <div
          className={`video${number}`}
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center"
          }}
        >
          {valueDefault.length > 0 && (
            <video controls="controls" style={{width: '200px'}}>
              <source
                src={process.env.REACT_APP_BACKEND_URL + "/public/" + valueDefault}
                type="video/mp4"
              />
              seu navegador não suporta HTML5
            </video>
          )}
        </div>
        {valueDefault.length === 0 && (
          <Button
            variant="contained"
            component="label"
            className={`btnVideo${number}`}
            fullWidth={isMobile}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Enviar vídeo
            <input
              type="file"
              accept="video/mp4"
              hidden
              onChange={e => handleChangeVideos(e, number)}
            />
          </Button>
        )}
      </Stack>
    );
  };

  const messageLayout = (number, valueDefault = "") => {
    return (
      <Stack
        sx={{
          border: "2px solid",
          borderColor: "primary.main",
          borderRadius: 2,
          padding: 2,
          position: "relative",
          backgroundColor: "background.paper",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: 2,
            borderColor: "primary.dark"
          }
        }}
        className={`stackMessage${number}`}
        key={`stackMessage${number}`}
      >
        <IconButton
          sx={{ 
            position: "absolute", 
            right: 8, 
            top: 8,
            color: "error.main",
            "&:hover": {
              backgroundColor: "error.light",
              color: "error.dark"
            }
          }}
          onClick={() => deleteElementsTypeOne(number, "message")}
          size="small"
        >
          <DeleteIcon />
        </IconButton>
        <Typography textAlign="center" variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Texto
        </Typography>
        <TextField
          label="Mensagem"
          defaultValue={valueDefault}
          multiline
          rows={isMobile ? 4 : 7}
          className={`message${number}`}
          name="text"
          variant="outlined"
          margin="dense"
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1
            }
          }}
        />
      </Stack>
    );
  };

  const intervalLayout = (number, valueDefault = 0) => {
    return (
      <Stack
        sx={{
          border: "2px solid",
          borderColor: "primary.main",
          borderRadius: 2,
          padding: 2,
          position: "relative",
          backgroundColor: "background.paper",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: 2,
            borderColor: "primary.dark"
          }
        }}
        className={`stackInterval${number}`}
        key={`stackInterval${number}`}
      >
        <IconButton
          sx={{ 
            position: "absolute", 
            right: 8, 
            top: 8,
            color: "error.main",
            "&:hover": {
              backgroundColor: "error.light",
              color: "error.dark"
            }
          }}
          onClick={() => deleteElementsTypeOne(number, "interval")}
          size="small"
        >
          <DeleteIcon />
        </IconButton>
        <Typography textAlign="center" variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Intervalo
        </Typography>
        <TextField
          label="Tempo em segundos"
          className={`interval${number}`}
          defaultValue={valueDefault}
          type="number"
          InputProps={{ inputProps: { min: 0, max: 120 } }}
          variant="outlined"
          margin="dense"
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1
            }
          }}
        />
      </Stack>
    );
  };

 

  useEffect(() => {
    if (open === "edit") {
      setLabels({
        title: "Editar conteúdo",
        btn: "Salvar"
      });

      setElementsSeq(data.data.seq);

    setElementsSeqEdit(data.data.seq);
    setElementsEdit(data.data.elements);
    if (data) {
      const elementsEditLoc = data.data.elements;
      const sequence = data.data.seq;

      sequence.map(item => {
        const itemNode = elementsEditLoc.filter(inode => inode.number === item)[0];
        if (itemNode.type === "message") {
          const numberLoc = parseInt(item.replace("message", ""));
          setElements(elm => [
            ...elm,
            messageLayout(numberLoc, itemNode.value)
          ]);
          setNumberMessages(old => {
            const arsOnly = sequence.filter(item => item.includes("message"));
            const arrNumberMax = arsOnly.map(item =>
              parseInt(item.replace("message", ""))
            );
            setNumberMessagesLast(Math.max.apply(null, arrNumberMax) + 1);
            return old + 1;
          });
        }
        if (itemNode.type === "interval") {
          const numberLoc = parseInt(item.replace("interval", ""));
          setElements(elm => [
            ...elm,
            intervalLayout(numberLoc, itemNode.value)
          ]);
          setNumberInterval(old => {
            const arsOnly = sequence.filter(item => item.includes("interval"));
            const arrNumberMax = arsOnly.map(item =>
              parseInt(item.replace("interval", ""))
            );
            setNumberIntervalLast(Math.max.apply(null, arrNumberMax) + 1);
            return old + 1;
          });
        }
        if (itemNode.type === "audio") {
          const numberLoc = parseInt(item.replace("audio", ""));
          setElements(elm => [
            ...elm,
            audioLayout(numberLoc, itemNode.value, itemNode.record ? "" : "ok")
          ]);
          setNumberAudio(old => {
            const arsOnly = sequence.filter(item => item.includes("audio"));
            const arrNumberMax = arsOnly.map(item =>
              parseInt(item.replace("audio", ""))
            );
            setNumberAudioLast(Math.max.apply(null, arrNumberMax) + 1);
            return old + 1;
          });
        }
        if (itemNode.type === "img") {
          const numberLoc = parseInt(item.replace("img", ""));
          setElements(elm => [...elm, imgLayout(numberLoc, itemNode.value)]);
          setNumberImg(old => {
            const arsOnly = sequence.filter(item => item.includes("img"));
            const arrNumberMax = arsOnly.map(item =>
              parseInt(item.replace("img", ""))
            );
            setNumberImgLast(Math.max.apply(null, arrNumberMax) + 1);
            return old + 1;
          });
        }
        if (itemNode.type === "video") {
          const numberLoc = parseInt(item.replace("video", ""));
          setElements(elm => [...elm, videoLayout(numberLoc, itemNode.value)]);
          setNumberVideo(old => {
            const arsOnly = sequence.filter(item => item.includes("video"));
            const arrNumberMax = arsOnly.map(item =>
              parseInt(item.replace("video", ""))
            );
            setNumberVideoLast(Math.max.apply(null, arrNumberMax) + 1);
            return old + 1;
          });
        }
      });
    }
    setActiveModal(true);
    }
    if (open === "create") {
      setLabels({
        title: "Adicionar menu ao fluxo",
        btn: "Adicionar"
      });
      setTextDig();
      setArrayOption([]);
      setActiveModal(true);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleClose = async () => {
    close(null);
    setActiveModal(false);
    setTimeout(() => {
      setMedias([]);
      setPreviewImg([]);
      setPreviewAudios([]);
      setPreviewVideos([]);
      setArrayOption([]);
      setElements([]);
      setElementsSeq([]);
      setElementsEdit([]);
      setElementsSeqEdit([]);
      setNumberMessages(0);
      setNumberMessagesLast(0);
      setNumberInterval(0);
      setNumberIntervalLast(0);
      setNumberAudio(0);
      setNumberAudioLast(0);
      setNumberVideo(0);
      setNumberVideoLast(0);
      setNumberImg(0);
      setNumberImgLast(0);
    }, 500);
  };

  const verifyButtonsUpload = () => {
    const newArrImg = elementsSeq.filter(item => item.includes("img"));
    const newArrAudio = elementsSeq.filter(item => item.includes("audio"));
    const newArrVideo = elementsSeq.filter(item => item.includes("video"));

    for (let i = 0; i < numberImg; i++) {
      const imgVerify = document.querySelector(
        `.btn${capitalize(newArrImg[i])}`
      );
      if (imgVerify) {
        return true;
      }
    }
    for (let i = 0; i < numberAudio; i++) {
      const audioVerify = document.querySelector(
        `.btn${capitalize(newArrAudio[i])}`
      );
      if (audioVerify) {
        return true;
      }
    }
    for (let i = 0; i < numberVideo; i++) {
      const videoVerify = document.querySelector(
        `.btn${capitalize(newArrVideo[i])}`
      );
      if (videoVerify) {
        return true;
      }
    }
  };

  const handleSaveNode = async () => {
    if (open === "edit") {
      setLoading(true);
      const formData = new FormData();

      medias.forEach(async (media, idx) => {
        const file = media;

        if (!file) {
          return;
        }

        if (media?.type.split("/")[0] == "image") {
          new Compressor(file, {
            quality: 0.7,

            async success(media) {
              formData.append("medias", media);
              formData.append("body", media.name);
            },
            error(err) {
              alert("erro");
              console.log(err.message);
            }
          });
        } else {
          formData.append("medias", media);
          formData.append("body", media.name);
        }
      });

      setTimeout(async () => {
        if (
          (numberAudio === 0 && numberVideo === 0 && numberImg === 0) ||
          medias.length === 0
        ) {
          try {
            const mountData = {
              seq: elementsSeq,
              elements: handleElements(null)
            };
            console.log('QUI', mountData)
            onUpdate({
              ...data,
              data: mountData
            });
            toast.success("Conteúdo adicionada com sucesso!");
            handleClose();
            setLoading(false);

            return;
          } catch (e) {
            console.log(e)
            setLoading(false);
          }
          return;
        }
        const verify = verifyButtonsUpload();
        if (verify) {
          setLoading(false);
          return toast.error("Delete os cards vazios(Imagem, Audio e Video)");
        }
        await api
          .post("/flowbuilder/content", formData)
          .then(async (res) => {
            const mountData = {
              seq: elementsSeq,
              elements: handleElements(res.data)
            };
            onUpdate({
              ...data,
              data: mountData
            });
            toast.success("Conteúdo adicionada com sucesso!");
            await handleClose();
            setLoading(false);
          })
          .catch(error => {
            console.log(error);
          });
      }, 1500);
    } else if (open === "create") {
      setLoading(true);
      const formData = new FormData();

      medias.forEach(async (media, idx) => {
        const file = media;

        if (!file) {
          return;
        }

        if (media?.type.split("/")[0] == "image") {
          new Compressor(file, {
            quality: 0.7,

            async success(media) {
              formData.append("medias", media);
              formData.append("body", media.name);
            },
            error(err) {
              alert("erro");
              console.log(err.message);
            }
          });
        } else {
          formData.append("medias", media);
          formData.append("body", media.name);
        }
      });

      setTimeout(async () => {
        if (numberAudio === 0 && numberVideo === 0 && numberImg === 0) {
          try {
            const mountData = {
              seq: elementsSeq,
              elements: handleElements(null)
            };
            onSave({
              ...mountData
            });
            toast.success("Conteúdo adicionada com sucesso!");
            handleClose();
            setLoading(false);

            return;
          } catch (e) {
            setLoading(false);
          }
        }
        const verify = verifyButtonsUpload();
        if (verify) {
          setLoading(false);
          return toast.error("Delete os cards vazios(Imagem, Audio e Video)");
        }
        await api
          .post("/flowbuilder/content", formData)
          .then(res => {
            const mountData = {
              seq: elementsSeq,
              elements: handleElements(res.data)
            };
            onSave({
              ...mountData
            });
            toast.success("Conteúdo adicionada com sucesso!");
            handleClose();
            setLoading(false);
          })
          .catch(error => {
            console.log(error);
          });
      }, 1500);
    }
  };

  const scrollToBottom = className => {
    const element = document.querySelector(className);
    element.scrollTop = element.scrollHeight;
  };

  return (
    <Dialog 
      open={activeModal} 
      maxWidth="md" 
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100vh' : '90vh',
          margin: isMobile ? 0 : 2,
        }
      }}
      className="flowbuilder-modal"
    >
      {!loading && (
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {labels.title}
          </Typography>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}
        <DialogContent 
          sx={{ 
            pt: 3, 
            pb: 2,
            display: loading ? 'none' : 'block',
            overflow: 'auto',
            maxHeight: isMobile ? 'calc(100vh - 200px)' : '70vh',
          }}
          className="body-card"
        >
          <Stack spacing={2}>
            {elements.map((item, index) => (
              <Box key={index}>{item}</Box>
            ))}
            <Stack 
              direction={isMobile ? "column" : "row"} 
              spacing={1}
              sx={{
                flexWrap: 'wrap',
                gap: 1,
                pt: 2
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setElements(old => [
                    ...old,
                    messageLayout(numberMessagesLast)
                  ]);
                  setNumberMessages(old => {
                    setElementsSeq(oldEleme => [
                      ...oldEleme,
                      `message${numberMessagesLast}`
                    ]);
                    return old + 1;
                  });
                  setNumberMessagesLast(old => old + 1);
                  setTimeout(() => {
                    scrollToBottom(".body-card");
                  }, 100);
                }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  flex: isMobile ? 1 : 'auto',
                }}
                startIcon={<Message />}
              >
                Texto
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setElements(old => [
                    ...old,
                    intervalLayout(numberIntervalLast)
                  ]);
                  setNumberInterval(old => {
                    setElementsSeq(oldEleme => [
                      ...oldEleme,
                      `interval${numberIntervalLast}`
                    ]);
                    return old + 1;
                  });
                  setNumberIntervalLast(old => old + 1);
                  setTimeout(() => {
                    scrollToBottom(".body-card");
                  }, 100);
                }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  flex: isMobile ? 1 : 'auto',
                }}
                startIcon={<AccessTime />}
              >
                Intervalo
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setElements(old => [...old, imgLayout(numberImgLast)]);
                  setNumberImg(old => {
                    setElementsSeq(oldEleme => [
                      ...oldEleme,
                      `img${numberImgLast}`
                    ]);
                    return old + 1;
                  });
                  setNumberImgLast(old => old + 1);
                  setTimeout(() => {
                    scrollToBottom(".body-card");
                  }, 100);
                }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  flex: isMobile ? 1 : 'auto',
                }}
                startIcon={<Image />}
              >
                Imagem
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setElements(old => [...old, audioLayout(numberAudioLast)]);
                  setNumberAudio(old => {
                    setElementsSeq(oldEleme => [
                      ...oldEleme,
                      `audio${numberAudioLast}`
                    ]);
                    return old + 1;
                  });
                  setNumberAudioLast(old => old + 1);
                  setTimeout(() => {
                    scrollToBottom(".body-card");
                  }, 100);
                }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  flex: isMobile ? 1 : 'auto',
                }}
                startIcon={<MicNone />}
              >
                Áudio
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setElements(old => [...old, videoLayout(numberVideoLast)]);
                  setNumberVideo(old => {
                    setElementsSeq(oldEleme => [
                      ...oldEleme,
                      `video${numberVideoLast}`
                    ]);
                    return old + 1;
                  });
                  setNumberVideoLast(old => old + 1);
                  setTimeout(() => {
                    scrollToBottom(".body-card");
                  }, 100);
                }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  flex: isMobile ? 1 : 'auto',
                }}
                startIcon={<Videocam />}
              >
                Vídeo
              </Button>
            </Stack>
          </Stack>
        </DialogContent>

        {!loading && (
          <DialogActions 
            sx={{ 
              px: 3, 
              pb: 2, 
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              gap: 1
            }}
          >
            <Button
              onClick={handleClose}
              color="inherit"
              variant="outlined"
              fullWidth={isMobile}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              {i18n.t("contactModal.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              onClick={() => handleSaveNode()}
              fullWidth={isMobile}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              {labels.btn}
            </Button>
          </DialogActions>
        )}

        {loading && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              py: 8
            }}
          >
            <CircularProgress size={isMobile ? 32 : 40} />
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Subindo os arquivos e criando o conteúdo...
            </Typography>
          </Box>
        )}
      </Dialog>
  );
};

export default FlowBuilderSingleBlockModal;
