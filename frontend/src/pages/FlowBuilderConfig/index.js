import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useCallback,
  useRef
} from "react";

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";

import api from "../../services/api";

import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  Typography
} from "@mui/material";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { CircularProgress } from "@mui/material";
import messageNode from "./nodes/messageNode.js";

import "reactflow/dist/style.css";

import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  onElementsRemove,
  useReactFlow
} from "react-flow-renderer";
import FlowBuilderAddTextModal from "../../components/FlowBuilderAddTextModal";
import FlowBuilderIntervalModal from "../../components/FlowBuilderIntervalModal";
import startNode from "./nodes/startNode";
import conditionNode from "./nodes/conditionNode";
import menuNode from "./nodes/menuNode";
import intervalNode from "./nodes/intervalNode";
import imgNode from "./nodes/imgNode";
import randomizerNode from "./nodes/randomizerNode";
import videoNode from "./nodes/videoNode";
import FlowBuilderConditionModal from "../../components/FlowBuilderConditionModal";
import FlowBuilderMenuModal from "../../components/FlowBuilderMenuModal";
import {
  AccessTime,
  CallSplit,
  DynamicFeed,
  Image,
  ImportExport,
  LibraryBooks,
  Message,
  MicNone,
  RocketLaunch,
  Videocam
} from "@mui/icons-material";
import RemoveEdge from "./nodes/removeEdge";
import FlowBuilderAddImgModal from "../../components/FlowBuilderAddImgModal";
import FlowBuilderTicketModal from "../../components/FlowBuilderAddTicketModal";
import FlowBuilderAddAudioModal from "../../components/FlowBuilderAddAudioModal";
import audioNode from "./nodes/audioNode";
import { useNodeStorage } from "../../stores/useNodeStorage";
import FlowBuilderRandomizerModal from "../../components/FlowBuilderRandomizerModal";
import FlowBuilderAddVideoModal from "../../components/FlowBuilderAddVideoModal";
import FlowBuilderSingleBlockModal from "../../components/FlowBuilderSingleBlockModal";
import singleBlockNode from "./nodes/singleBlockNode";
import { colorPrimary } from "../../styles/styles";
import { useTheme, useMediaQuery, Box, Zoom } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import "./FlowBuilderConfig.css";
import ticketNode from "./nodes/ticketNode";
import { ConfirmationNumber } from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    position: "relative",
    backgroundColor: "#F8F9FA",
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(0.5)
    }
  },
  speeddial: {
    backgroundColor: "red"
  },
  saveButton: {
    position: "fixed",
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: 1000,
    minWidth: "auto"
  },
  saveReminder: {
    position: "fixed",
    top: 80,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 999,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: theme.spacing(1.5, 3),
    borderRadius: "50px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    fontWeight: 500,
    animation: "$pulse 2s ease-in-out infinite",
    [theme.breakpoints.down("sm")]: {
      top: 70,
      padding: theme.spacing(1, 2),
      fontSize: "0.875rem",
      width: "90%",
      textAlign: "center"
    }
  },
  "@keyframes pulse": {
    "0%, 100%": {
      opacity: 1,
      transform: "translateX(-50%) scale(1)"
    },
    "50%": {
      opacity: 0.8,
      transform: "translateX(-50%) scale(1.05)"
    }
  }
}));

function geraStringAleatoria(tamanho) {
  var stringAleatoria = "";
  var caracteres =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < tamanho; i++) {
    stringAleatoria += caracteres.charAt(
      Math.floor(Math.random() * caracteres.length)
    );
  }
  return stringAleatoria;
}

const nodeTypes = {
  message: messageNode,
  start: startNode,
  condition: conditionNode,
  menu: menuNode,
  interval: intervalNode,
  img: imgNode,
  audio: audioNode,
  randomizer: randomizerNode,
  video: videoNode,
  singleBlock: singleBlockNode,
  ticket: ticketNode
};

const edgeTypes = {
  buttonedge: RemoveEdge
};

const initialNodes = [
  {
    id: "1",
    position: { x: 250, y: 100 },
    data: { label: "Inicio do fluxo" },
    type: "start"
  }
];

const initialEdges = [];

export const FlowBuilderConfig = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const storageItems = useNodeStorage();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [dataNode, setDataNode] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [modalAddText, setModalAddText] = useState(null);
  const [modalAddInterval, setModalAddInterval] = useState(false);
  const [modalAddCondition, setModalAddCondition] = useState(null);
  const [modalAddMenu, setModalAddMenu] = useState(null);
  const [modalAddImg, setModalAddImg] = useState(null);
  const [modalAddAudio, setModalAddAudio] = useState(null);
  const [modalAddRandomizer, setModalAddRandomizer] = useState(null);
  const [modalAddVideo, setModalAddVideo] = useState(null);
  const [modalAddSingleBlock, setModalAddSingleBlock] = useState(null);
  const [modalAddTicket, setModalAddTicket] = useState(null)

  const connectionLineStyle = { stroke: "#2b2b2b", strokeWidth: "6px" };

  const addNode = (type, data) => {
    const posY = nodes[nodes.length - 1].position.y;
    const posX =
      nodes[nodes.length - 1].position.x + nodes[nodes.length - 1].width + 40;
    if (type === "start") {
      return setNodes(old => {
        return [
          ...old.filter(item => item.id !== "1"),
          {
            id: "1",
            position: { x: posX, y: posY },
            data: { label: "Inicio do fluxo" },
            type: "start"
          }
        ];
      });
    }
    if (type === "text") {
      return setNodes(old => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { label: data.text },
            type: "message"
          }
        ];
      });
    }
    if (type === "interval") {
      return setNodes(old => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { label: `Intervalo ${data.sec} seg.`, sec: data.sec },
            type: "interval"
          }
        ];
      });
    }
    if (type === "condition") {
      return setNodes(old => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: {
              key: data.key,
              condition: data.condition,
              value: data.value
            },
            type: "condition"
          }
        ];
      });
    }
    if (type === "menu") {
      return setNodes(old => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: {
              message: data.message,
              arrayOption: data.arrayOption
            },
            type: "menu"
          }
        ];
      });
    }
    if (type === "img") {
      return setNodes(old => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { url: data.url },
            type: "img"
          }
        ];
      });
    }
    if (type === "audio") {
      return setNodes(old => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { url: data.url, record: data.record },
            type: "audio"
          }
        ];
      });
    }
    if (type === "randomizer") {
      return setNodes(old => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { percent: data.percent },
            type: "randomizer"
          }
        ];
      });
    }
    if (type === "video") {
      return setNodes(old => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { url: data.url },
            type: "video"
          }
        ];
      });
    }
    if (type === "singleBlock") {
      return setNodes(old => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "singleBlock"
          }
        ];
      });
    }

    if (type === "ticket") {
      return setNodes(old => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "ticket"
          }
        ];
      });
    }


  };

  const textAdd = data => {
    addNode("text", data);
  };

  const intervalAdd = data => {
    addNode("interval", data);
  };

  const conditionAdd = data => {
    addNode("condition", data);
  };

  const menuAdd = data => {
    addNode("menu", data);
  };

  const imgAdd = data => {
    addNode("img", data);
  };

  const audioAdd = data => {
    addNode("audio", data);
  };

  const randomizerAdd = data => {
    addNode("randomizer", data);
  };

  const videoAdd = data => {
    addNode("video", data);
  };

  const singleBlockAdd = data => {
    addNode("singleBlock", data);
  };

  const ticketAdd = data => {
    addNode("ticket", data)
  }

  useEffect(() => {
    setLoading(true);
    setHasUnsavedChanges(false); // Resetar ao carregar novo fluxo
    isInitialLoad.current = true;
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get(`/flowbuilder/flow/${id}`);
          if (data.flow.flow !== null) {
            setNodes(data.flow.flow.nodes);
            setEdges(data.flow.flow.connections);
          }
          setLoading(false);
          setHasUnsavedChanges(false); // Garantir que não há mudanças não salvas após carregar
          setTimeout(() => {
            isInitialLoad.current = false;
          }, 2000);
        } catch (err) {
          toastError(err);
          setLoading(false);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [id]);

  useEffect(() => {
    if (storageItems.action === "delete") {
      setNodes(old => old.filter(item => item.id !== storageItems.node));
      setEdges(old => {
        const newData = old.filter(item => item.source !== storageItems.node);
        const newClearTarget = newData.filter(
          item => item.target !== storageItems.node
        );
        return newClearTarget;
      });
      storageItems.setNodesStorage("");
      storageItems.setAct("idle");
    }
    if (storageItems.action === "duplicate") {
      const nodeDuplicate = nodes.filter(
        item => item.id === storageItems.node
      )[0];
      const maioresX = nodes.map(node => node.position.x);
      const maiorX = Math.max(...maioresX);
      const finalY = nodes[nodes.length - 1].position.y;
      const nodeNew = {
        ...nodeDuplicate,
        id: geraStringAleatoria(30),
        position: {
          x: maiorX + 240,
          y: finalY
        },
        selected: false,
        style: { backgroundColor: "#555555", padding: 0, borderRadius: 8 }
      };
      setNodes(old => [...old, nodeNew]);
      storageItems.setNodesStorage("");
      storageItems.setAct("idle");
    }
  }, [storageItems.action]);

  const loadMore = () => {
    setPageNumber(prevState => prevState + 1);
  };

  const handleScroll = e => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    params => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef(null);

  const saveFlow = async (silent = false) => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await api.post("/flowbuilder/flow", {
        idFlow: id,
        nodes: nodes,
        connections: edges
      });
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      if (!silent) {
        toast.success("Fluxo salvo com sucesso", {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        // Notificação silenciosa para auto-save
        toast.success("Fluxo salvo automaticamente", {
          position: "bottom-right",
          autoClose: 1500,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar fluxo:", error);
      if (!silent) {
        toast.error("Erro ao salvar fluxo", {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save a cada 10 segundos se houver mudanças
  useEffect(() => {
    if (!id || loading) return;

    // Limpar timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Se houver mudanças não salvas, agendar auto-save
    if (hasUnsavedChanges && nodes.length > 0) {
      saveTimeoutRef.current = setTimeout(() => {
        saveFlow(true); // Salvar silenciosamente
      }, 10000); // 10 segundos
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, edges, hasUnsavedChanges, id, loading]);

  // Detectar mudanças nos nodes e edges (após o carregamento inicial)
  const isInitialLoad = useRef(true);
  useEffect(() => {
    if (loading) {
      isInitialLoad.current = true;
      setHasUnsavedChanges(false);
      return;
    }
    
    // Aguardar um pouco após o carregamento inicial antes de marcar como não salvo
    if (isInitialLoad.current && nodes.length > 0) {
      const timer = setTimeout(() => {
        isInitialLoad.current = false;
      }, 2000);
      return () => clearTimeout(timer);
    }
    
    // Só marcar como não salvo se não for o carregamento inicial
    if (!isInitialLoad.current && nodes.length > 0) {
      setHasUnsavedChanges(true);
    }
  }, [nodes, edges, loading]);

  const doubleClick = (event, node) => {
    console.log("NODE", node);
    setDataNode(node);
    if (node.type === "message") {
      setModalAddText("edit");
    }
    if (node.type === "interval") {
      setModalAddInterval("edit");
    }
    if (node.type === "condition") {
      setModalAddCondition("edit");
    }
    if (node.type === "menu") {
      setModalAddMenu("edit");
    }
    if (node.type === "img") {
      setModalAddImg("edit");
    }
    if (node.type === "audio") {
      setModalAddAudio("edit");
    }
    if (node.type === "randomizer") {
      setModalAddRandomizer("edit");
    }
    if (node.type === "singleBlock") {
      setModalAddSingleBlock("edit");
    }
    if (node.type === "ticket") {
      setModalAddTicket("edit")
    }
  };

  const clickNode = (event, node) => {
    setNodes(old =>
      old.map(item => {
        if (item.id === node.id) {
          return {
            ...item,
            style: { backgroundColor: "#0000FF", padding: 1, borderRadius: 8 }
          };
        }
        return {
          ...item,
          style: { backgroundColor: "#13111C", padding: 0, borderRadius: 8 }
        };
      })
    );
  };
  const clickEdge = (event, node) => {
    setNodes(old =>
      old.map(item => {
        return {
          ...item,
          style: { backgroundColor: "#13111C", padding: 0, borderRadius: 8 }
        };
      })
    );
  };

  const updateNode = dataAlter => {
    console.log('DATA ALTER', dataAlter)
    setNodes(old =>
      old.map(itemNode => {
        if (itemNode.id === dataAlter.id) {
          return dataAlter;
        }
        return itemNode;
      })
    );
    setModalAddText(null);
    setModalAddInterval(null);
    setModalAddMenu(null);
  };

  const actions = [
    {
      icon: (
        <RocketLaunch
          sx={{
            color: "#3ABA38"
          }}
        />
      ),
      name: "Inicio",
      type: "start"
    },
    {
      icon: (
        <LibraryBooks
          sx={{
            color: "#EC5858"
          }}
        />
      ),
      name: "Conteúdo",
      type: "content"
    },
    {
      icon: (
        <DynamicFeed
          sx={{
            color: "#683AC8"
          }}
        />
      ),
      name: "Menu",
      type: "menu"
    },
    {
      icon: (
        <CallSplit
          sx={{
            color: "#1FBADC"
          }}
        />
      ),
      name: "Randomizador",
      type: "random"
    },
    {
      icon: (
        <AccessTime
          sx={{
            color: "#F7953B"
          }}
        />
      ),
      name: "Intervalo",
      type: "interval"
    },
    {
      icon: (
        <ConfirmationNumber
          sx={{
            color: "#F7953B"
          }}
        />
      ),
      name: "Ticket",
      type: "ticket"
    }
  ];

  const clickActions = type => {
    switch (type) {
      case "start":
        addNode("start");
        break;
      case "menu":
        setModalAddMenu("create");
        break;
      case "content":
        setModalAddSingleBlock("create");
        break;
      case "random":
        setModalAddRandomizer("create");
        break;
      case "interval":
        setModalAddInterval("create");
        break;
      case "ticket":
        setModalAddTicket("create")
      default:
    }
  };

  return (
    <Stack sx={{ height: "100vh", width: "100%", overflow: "hidden" }}>
      <FlowBuilderAddTextModal
        open={modalAddText}
        onSave={textAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddText}
      />
      <FlowBuilderIntervalModal
        open={modalAddInterval}
        onSave={intervalAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddInterval}
      />
      <FlowBuilderConditionModal
        open={modalAddCondition}
        onSave={conditionAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddCondition}
      />
      <FlowBuilderMenuModal
        open={modalAddMenu}
        onSave={menuAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddMenu}
      />
      <FlowBuilderAddImgModal
        open={modalAddImg}
        onSave={imgAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddImg}
      />
      <FlowBuilderAddAudioModal
        open={modalAddAudio}
        onSave={audioAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddAudio}
      />
      <FlowBuilderRandomizerModal
        open={modalAddRandomizer}
        onSave={randomizerAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddRandomizer}
      />
      <FlowBuilderAddVideoModal
        open={modalAddVideo}
        onSave={videoAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddVideo}
      />
      <FlowBuilderSingleBlockModal
        open={modalAddSingleBlock}
        onSave={singleBlockAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddSingleBlock}
      />
      <FlowBuilderTicketModal
        open={modalAddTicket}
        onSave={ticketAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddTicket}
      />
      <MainHeader>
        <Title>Desenhe seu fluxo</Title>
      </MainHeader>
      {!loading && (
        <Paper
          className={classes.mainPaper}
          variant="outlined"
          onScroll={handleScroll}
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <SpeedDial
            ariaLabel="SpeedDial basic example"
            className="flow-speeddial"
            sx={{
              position: "absolute",
              top: isMobile ? 12 : isTablet ? 14 : 16,
              left: isMobile ? 12 : isTablet ? 14 : 16,
              zIndex: 1000,
              ".MuiSpeedDial-fab": {
                backgroundColor: colorPrimary(),
                width: isMobile ? 48 : isTablet ? 52 : 56,
                height: isMobile ? 48 : isTablet ? 52 : 56,
                '&:hover': {
                  backgroundColor: colorPrimary(),
                  transform: "scale(1.1)"
                },
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
              }
            }}
            icon={<SpeedDialIcon />}
            direction={"down"}
          >
            {actions.map((action, index) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                tooltipOpen={!isMobile}
                tooltipPlacement={isMobile ? "left" : "right"}
                onClick={() => clickActions(action.type)}
                className="flow-speeddial-action"
                sx={{
                  animation: `speedDialAction 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.05}s both`
                }}
              />
            ))}
          </SpeedDial>
          <Box className={classes.saveReminder}>
            {isSaving ? (
              <Typography variant="body2" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1, fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                <CircularProgress size={isMobile ? 12 : 14} /> Salvando...
              </Typography>
            ) : lastSaved ? (
              <Typography variant="body2" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1, fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                ✓ Salvo às {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            ) : hasUnsavedChanges ? (
              <Typography variant="body2" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1, fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                💾 Alterações não salvas - Salvando automaticamente em breve...
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                💾 Não se esqueça de salvar seu fluxo!
              </Typography>
            )}
          </Box>
          <Zoom in={true}>
            <Box
              sx={{
                position: "fixed",
                bottom: isMobile ? 16 : isTablet ? 20 : 24,
                right: isMobile ? 16 : isTablet ? 20 : 24,
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 1
              }}
            >
              <Box
                component="button"
                onClick={() => !isSaving && saveFlow(false)}
                disabled={isSaving}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: isMobile ? 0.5 : 1,
                  padding: isMobile ? "10px 18px" : isTablet ? "11px 22px" : "12px 28px",
                  backgroundColor: colorPrimary(),
                  color: "white",
                  border: "none",
                  borderRadius: "50px",
                  fontSize: isMobile ? "0.813rem" : isTablet ? "0.875rem" : "0.938rem",
                  fontWeight: 600,
                  cursor: isSaving ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  minWidth: isMobile ? "auto" : "130px",
                  outline: "none",
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                  "&:hover:not(:disabled)": {
                    transform: "translateY(-2px) scale(1.02)",
                    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15)",
                    backgroundColor: colorPrimary(),
                    filter: "brightness(1.08)"
                  },
                  "&:active:not(:disabled)": {
                    transform: "translateY(0) scale(0.98)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)"
                  },
                  "&:disabled": {
                    opacity: 0.75,
                    cursor: "not-allowed",
                    transform: "none",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
                  },
                  "&:focus-visible": {
                    outline: `2px solid ${colorPrimary()}`,
                    outlineOffset: "2px"
                  },
                  "@media (max-width: 480px)": {
                    padding: "9px 16px",
                    fontSize: "0.75rem",
                    minWidth: "auto",
                    gap: 0.5
                  }
                }}
              >
                {isSaving ? (
                  <>
                    <CircularProgress 
                      size={isMobile ? 14 : 16} 
                      sx={{ color: "white", display: "flex" }} 
                      thickness={4}
                    />
                    {!isMobile && (
                      <span style={{ whiteSpace: "nowrap" }}>Salvando...</span>
                    )}
                  </>
                ) : (
                  <>
                    <SaveIcon sx={{ fontSize: isMobile ? 16 : isTablet ? 18 : 20 }} />
                    {!isMobile && (
                      <span style={{ whiteSpace: "nowrap" }}>Salvar</span>
                    )}
                  </>
                )}
              </Box>
            </Box>
          </Zoom>

          <Box
            className="flow-reactflow-container"
            sx={{
              width: "100%",
              height: isMobile ? "calc(100vh - 120px)" : isTablet ? "calc(100vh - 160px)" : "calc(100vh - 180px)",
              position: "relative",
              display: "flex",
              flex: 1,
              minHeight: 0
            }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              deleteKeyCode={["Backspace", "Delete"]}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeDoubleClick={doubleClick}
              onNodeClick={clickNode}
              onEdgeClick={clickEdge}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              connectionLineStyle={connectionLineStyle}
              style={{
                backgroundColor: "#F8F9FA"
              }}
              edgeTypes={edgeTypes}
              variant={"cross"}
              defaultEdgeOptions={{
                style: { 
                  color: colorPrimary(), 
                  strokeWidth: isMobile ? "4px" : "6px" 
                },
                animated: true
              }}
            >
              <Controls 
                className="flow-controls"
                showInteractive={!isMobile}
                style={{
                  transform: isMobile ? 'scale(0.85)' : isTablet ? 'scale(0.95)' : 'scale(1)',
                  transformOrigin: 'bottom right'
                }}
              />
              <MiniMap 
                className="flow-minimap"
                nodeColor={colorPrimary()}
                maskColor="rgba(0, 0, 0, 0.1)"
                style={{
                  width: isMobile ? 100 : isTablet ? 150 : 200,
                  height: isMobile ? 70 : isTablet ? 110 : 150,
                  position: 'absolute',
                  bottom: isMobile ? 8 : 16,
                  right: isMobile ? 8 : 16
                }}
              />
              <Background 
                variant="dots" 
                gap={isMobile ? 12 : isTablet ? 16 : 20} 
                size={isMobile ? 0.5 : isTablet ? 0.75 : 1} 
                color={colorPrimary()}
                style={{ opacity: 0.3 }}
              />
            </ReactFlow>
          </Box>
            {/* <Stack
                style={{
                  backgroundColor: "#1B1B1B",
                  height: "70%",
                  width: "150px",
                  position: "absolute",
                  left: 0,
                  top: 0,
                  zIndex: 1111,
                  borderRadius: 3,
                  padding: 8
                }}
                spacing={1}
              >
                <Typography style={{ color: "#ffffff", textAlign: "center" }}>
                  Adicionar
                </Typography>
                <Button
                  onClick={() => addNode("start")}
                  variant="contained"
                  style={{
                    backgroundColor: "#3ABA38",
                    color: "#ffffff",
                    padding: 8,
                    "&:hover": {
                      backgroundColor: "#3e3b7f"
                    },
                    textTransform: "none"
                  }}
                >
                  <RocketLaunch
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px"
                    }}
                  />
                  Inicio
                </Button>
                <Button
                  onClick={() => setModalAddText("create")}
                  variant="contained"
                  style={{
                    backgroundColor: "#6865A5",
                    color: "#ffffff",
                    padding: 8,
                    textTransform: "none"
                  }}
                >
                  <Message
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px"
                    }}
                  />
                  Texto
                </Button>
                <Button
                  onClick={() => setModalAddInterval("create")}
                  variant="contained"
                  style={{
                    backgroundColor: "#F7953B",
                    color: "#ffffff",
                    padding: 8,
                    textTransform: "none"
                  }}
                >
                  <AccessTime
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px"
                    }}
                  />
                  Intervalo
                </Button>
                <Button
                  onClick={() => setModalAddCondition("create")}
                  variant="contained"
                  disabled
                  style={{
                    backgroundColor: "#524d4d",
                    color: "#cccaed",
                    padding: 8,
                    textTransform: "none"
                  }}
                >
                  <ImportExport
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px"
                    }}
                  />
                  Condição
                </Button>
                <Button
                  onClick={() => setModalAddMenu("create")}
                  variant="contained"
                  style={{
                    backgroundColor: "#683AC8",
                    color: "#ffffff",
                    padding: 8,
                    textTransform: "none"
                  }}
                >
                  <DynamicFeed
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px"
                    }}
                  />
                  Menu
                </Button>
                <Button
                  onClick={() => setModalAddAudio("create")}
                  variant="contained"
                  style={{
                    backgroundColor: "#6865A5",
                    color: "#ffffff",
                    padding: 8,
                    textTransform: "none"
                  }}
                >
                  <MicNone
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px"
                    }}
                  />
                  Audio
                </Button>
                <Button
                  onClick={() => setModalAddVideo("create")}
                  variant="contained"
                  style={{
                    backgroundColor: "#6865A5",
                    color: "#ffffff",
                    padding: 8,
                    textTransform: "none"
                  }}
                >
                  <Videocam
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px"
                    }}
                  />
                  Video
                </Button>
                <Button
                  onClick={() => setModalAddImg("create")}
                  variant="contained"
                  style={{
                    backgroundColor: "#6865A5",
                    color: "#ffffff",
                    padding: 8,
                    textTransform: "none"
                  }}
                >
                  <Image
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px"
                    }}
                  />
                  Imagem
                </Button>
                <Button
                  onClick={() => setModalAddRandomizer("create")}
                  variant="contained"
                  style={{
                    backgroundColor: "#1FBADC",
                    color: "#ffffff",
                    padding: 8,
                    textTransform: "none"
                  }}
                >
                  <CallSplit
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px"
                    }}
                  />
                  Randomizador
                </Button>
                <Button
                  onClick={() => setModalAddSingleBlock("create")}
                  variant="contained"
                  style={{
                    backgroundColor: "#EC5858",
                    color: "#ffffff",
                    padding: 8,
                    textTransform: "none"
                  }}
                >
                  <LibraryBooks
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px"
                    }}
                  />
                  Conteúdo
                </Button>
              </Stack> */}
        </Paper>
      )}
      {loading && (
        <Stack justifyContent={"center"} alignItems={"center"} height={"70vh"}>
          <CircularProgress />
        </Stack>
      )}
    </Stack>
  );
};