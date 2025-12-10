import {
  ArrowForwardIos,
  ContentCopy,
  Delete,
  Message
} from "@mui/icons-material";
import React, { memo } from "react";

import { Handle } from "react-flow-renderer";
import { useNodeStorage } from "../../../stores/useNodeStorage";

export default memo(({ data, isConnectable, id }) => {
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
      >
        <ArrowForwardIos
          sx={{
            color: "#ffff",
            width: "8px",
            height: "8px",
            marginLeft: "2.5px",
            marginBottom: "1px",
            pointerEvents: "none"
          }}
        />
      </Handle>
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
        <Message
          sx={{
            width: "14px",
            height: "14px",
            marginRight: "4px"
          }}
        />
        <div style={{ color: "#ededed", fontSize: "14px", fontWeight: 500 }}>Mensagem</div>
      </div>
      <div style={{ color: "#ededed", fontSize: "11px", width: "100%", maxWidth: "180px", marginTop: "4px", wordBreak: "break-word" }}>
        {data.label}
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
      >
        <ArrowForwardIos
          sx={{
            color: "#ffff",
            width: "8px",
            height: "8px",
            marginLeft: "2.5px",
            marginBottom: "1px",
            pointerEvents: "none"
          }}
        />
      </Handle>
    </div>
  );
});
