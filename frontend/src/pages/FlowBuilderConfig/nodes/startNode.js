import { ArrowForwardIos, Message, RocketLaunch } from "@mui/icons-material";
import React, { memo } from "react";

import { Handle } from "react-flow-renderer";

export default memo(({ data, isConnectable }) => {
  return (
    <div
      style={{
        backgroundColor: "#F9FDF9",
        padding: "8px",
        borderRadius: "8px",
        boxShadow: "rgba(0, 0, 0, 0.05) 0px 3px 5px",
        border: '1px solid rgba(58, 186, 56, 0.25)',
        minWidth: "140px",
        maxWidth: "180px",
        width: "auto",
        position: "relative"
      }}
    >
      <div
        style={{
          color: "#ededed",
          fontSize: "14px",
          flexDirection: "row",
          display: "flex",
          alignItems: "center"
        }}
      >
        <RocketLaunch
          sx={{
            width: "14px",
            height: "14px",
            marginRight: "4px",
            color: "#3aba38"
          }}
        />
        <div style={{ color: "#232323", fontSize: "14px", fontWeight: 500 }}>
          Inicio do fluxo
        </div>
      </div>
      <div style={{ color: "#727272", fontSize: "11px", marginTop: "4px" }}>
        Este bloco marca o inicio do seu fluxo!
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
            pointerEvents: 'none'
          }}
        />
      </Handle>
    </div>
  );
});
