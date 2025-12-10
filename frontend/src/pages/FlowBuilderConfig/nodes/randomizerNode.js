import {
  ArrowForwardIos,
  CallSplit,
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
        backgroundColor: "#F8FCFD",
        padding: "8px",
        borderRadius: "8px",
        minWidth: "140px",
        maxWidth: "185px",
        width: "auto",
        border: "1px solid rgba(31, 186, 220, 0.25)",
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
          sx={{ width: "12px", height: "12px", color: "#1FBADC" }}
        />

        <Delete
          onClick={() => {
            storageItems.setNodesStorage(id);
            storageItems.setAct("delete");
          }}
          sx={{ width: "12px", height: "12px", color: "#1FBADC" }}
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
        <CallSplit
          sx={{
            width: "16px",
            height: "16px",
            marginRight: "4px",
            marginTop: "4px",
            color: "#1FBADC"
          }}
        />
        <div style={{ color: "#232323", fontSize: "14px", fontWeight: 500 }}>Randomizador</div>
      </div>
      <div
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontSize: "12px",
          justifyContent: "end",
          position: "relative",
          display: "flex",
          color: "#232323",
          marginTop: "4px"
        }}
      >
        {`${data.percent}%`}
      </div>
      <Handle
        type="source"
        position="right"
        id="a"
        style={{
          background: "#0000FF",
          width: "14px",
          height: "14px",
          right: "-9px",
          marginTop: "-5px",
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
      <div
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontSize: "12px",
          justifyContent: "end",
          position: "relative",
          display: "flex",
          marginTop: "8px",
          color: "#232323"
        }}
      >
        {`${100 - data.percent}%`}
      </div>
      <Handle
        type="source"
        position="right"
        id="b"
        style={{
          background: "#0000FF",
          width: "14px",
          height: "14px",
          right: "-9px",
          top: 73,
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
