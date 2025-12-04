import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import ModalImage from "react-modal-image";
import api from "../../services/api";

const useStyles = makeStyles(theme => ({
  messageMedia: {
    objectFit: "cover",
    margin: 15,
    width: 140,
    height: 140,
    borderRadius: 10,
  },
}));

const ModalImageContatc = ({ imageUrl }) => {
  const classes = useStyles();
  const [fetching, setFetching] = useState(true);
  const [blobUrl, setBlobUrl] = useState("");
  

  useEffect(() => {
    if (!imageUrl) return;
    
    // Se a URL já é completa (começa com http), usar diretamente
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      setBlobUrl(imageUrl);
      setFetching(false);
      return;
    }
    
    // Caso contrário, fazer requisição via API
    const fetchImage = async () => {
      try {
        const { data, headers } = await api.get(imageUrl, {
          responseType: "blob",
        });
        const url = window.URL.createObjectURL(
          new Blob([data], { type: headers["content-type"] })
        );
        setBlobUrl(url);
        setFetching(false);
      } catch (error) {
        console.error("Erro ao carregar imagem:", error);
        // Em caso de erro, tentar usar a URL diretamente
        setBlobUrl(imageUrl);
        setFetching(false);
      }
    };
    fetchImage();
  }, [imageUrl]);

  return (
    <ModalImage
      className={classes.messageMedia}
      smallSrcSet={fetching ? imageUrl : blobUrl}
      medium={fetching ? imageUrl : blobUrl}
      large={fetching ? imageUrl : blobUrl}
      showRotate="true"
      alt="image"
    />
  );
};


export default ModalImageContatc;