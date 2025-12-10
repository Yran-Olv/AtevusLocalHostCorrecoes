import { ContentCopy, Delete, Message, MicNone } from "@mui/icons-material";
import React, { memo } from "react";

import { Handle } from "react-flow-renderer";
import { useNodeStorage } from "../../../stores/useNodeStorage";

export default memo(({ data, isConnectable, id }) => {
  const link =
    process.env.REACT_APP_BACKEND_URL === "http://localhost:8090"
      ? "http://localhost:8090"
      : process.env.REACT_APP_BACKEND_URL;

  const storageItems = useNodeStorage();
  return (
    <div
      style={{ 
        backgroundColor: "#555", 
        padding: "8px", 
        borderRadius: "8px",
        minWidth: "140px",
        maxWidth: "180px",
        width: "auto",
        position: "relative"
      }}
    >
      <Handle
        type="target"
        position="left"
        style={{ 
          background: "#0000FF",
          width: "14px",
          height: "14px",
          top: "20px",
          left: "-9px",
          cursor: 'pointer'
        }}
        onConnect={params => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          right: 5,
          top: 5,
          cursor: "pointer",
          gap: 6
        }}
      >
        <ContentCopy
          onClick={() => {
            storageItems.setNodesStorage(id);
            storageItems.setAct("duplicate");
          }}
          sx={{ width: "12px", height: "12px", color: "#ffff" }}
        />

        <Delete
          onClick={() => {
            storageItems.setNodesStorage(id);
            storageItems.setAct("delete");
          }}
          sx={{ width: "12px", height: "12px", color: "#ffff" }}
        />
      </div>
      <div
        style={{
          color: "#ededed",
          fontSize: "14px",
          flexDirection: "row",
          display: "flex",
          alignItems: "center"
        }}
      >
        <MicNone
          sx={{
            width: "14px",
            height: "14px",
            marginRight: "4px"
          }}
        />
        <div style={{ color: "#ededed", fontSize: "14px", fontWeight: 500 }}>Audio</div>
      </div>
      <div style={{ color: "#ededed", fontSize: "11px", marginTop: "4px" }}>
        <div style={{ marginBottom: "4px", fontSize: "10px" }}>
          {data.record && data.record ? (
            <div>Gravado na hora</div>
          ) : (
            <div>Audio enviado</div>
          )}
        </div>
        <audio controls="controls" style={{ width: "100%", maxWidth: "180px" }}>
          <source src={`${link}/public/${data.url}`} type="audio/mp3" />
          seu navegador não suporta HTML5
        </audio>
      </div>
      <Handle
        type="source"
        position="right"
        id="a"
        style={{ 
          background: "#0000FF",
          width: "14px",
          height: "14px",
          top: "70%",
          right: "-9px",
          cursor: 'pointer'
        }}
        isConnectable={isConnectable}
      />
    </div>
  );
});
