import {
  AccessTime,
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
        backgroundColor: "#FFFBFA",
        padding: "8px",
        borderRadius: "8px",
        minWidth: "140px",
        maxWidth: "180px",
        width: "auto",
        border: '1px solid rgba(240, 135, 90, 0.25)',
        boxShadow: 'rgba(0, 0, 0, 0.05) 0px 3px 5px',
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
          sx={{ width: "12px", height: "12px", color: "#F7953B" }}
        />

        <Delete
          onClick={() => {
            storageItems.setNodesStorage(id);
            storageItems.setAct("delete");
          }}
          sx={{ width: "12px", height: "12px", color: "#F7953B" }}
        />
      </div>
      <div
        style={{
          color: "#ededed",
          fontSize: "16px",
          flexDirection: "row",
          display: "flex"
        }}
      >
        <AccessTime
          sx={{
            width: "16px",
            height: "16px",
            marginRight: "4px",
            marginTop: "4px",
            color: "#F7953B"
          }}
        />
        <div style={{ color: "#232323", fontSize: "14px", fontWeight: 500 }}>Intervalo</div>
      </div>
      <div style={{ color: "#232323", fontSize: "11px", marginTop: "4px" }}>
        {data.sec} segundos
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
