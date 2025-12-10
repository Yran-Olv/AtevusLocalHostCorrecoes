import {
  ArrowForwardIos,
  ContentCopy,
  Delete,
  DynamicFeed,
  ImportExport,
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
        backgroundColor: "#FAFBFF",
        padding: "8px",
        borderRadius: "8px",
        minWidth: "140px",
        maxWidth: "180px",
        width: "auto",
        boxShadow: "0px 3px 5px rgba(0,0,0,.05)",
        border: "1px solid rgba(104, 58, 200, 0.25)",
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
          sx={{ width: "12px", height: "12px", color: "#683AC8" }}
        />

        <Delete
          onClick={() => {
            storageItems.setNodesStorage(id);
            storageItems.setAct("delete");
          }}
          sx={{ width: "12px", height: "12px", color: "#683AC8" }}
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
        <DynamicFeed
          sx={{
            width: "16px",
            height: "16px",
            marginRight: "4px",
            marginTop: "4px",
            color: "#683AC8"
          }}
        />
        <div style={{ color: "#232323", fontSize: "14px", fontWeight: 500 }}>Menu</div>
      </div>
      <div>
        <div
          style={{
            color: "#232323",
            fontSize: "12px",
            height: "50px",
            overflow: "hidden",
            marginBottom: "8px"
          }}
        >
          {data.message}
        </div>
      </div>
      {data.arrayOption.map(option => (
        <div
          style={{
            marginBottom: "9px",
            justifyContent: "end",
            display: "flex"
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: "10px",
              position: "relative",
              display: "flex",
              color: "#232323",
              justifyContent: "center",
              flexDirection: "column",
              alignSelf: "end"
            }}
          >
            {`[${option.number}] ${option.value}`}
          </div>
          <Handle
            type="source"
            position="right"
            id={"a" + option.number}
            style={{
              top: 74 + 23 * option.number,
              background: "#0000FF",
              width: "14px",
              height: "14px",
              right: "-9px",
              cursor: 'pointer'
            }}
            isConnectable={isConnectable}
          >
            <ArrowForwardIos
              sx={{
                color: "#ffff",
                width: "10px",
                height: "10px",
                marginLeft: "2.9px",
                marginBottom: "1px",
                pointerEvents: "none"
              }}
            />
          </Handle>
        </div>
      ))}
    </div>
  );
});
