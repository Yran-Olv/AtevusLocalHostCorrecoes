import { ContentCopy, Delete, Image, Message } from "@mui/icons-material";
import React, { memo } from "react";

import { Handle } from "react-flow-renderer";
import { useNodeStorage } from "../../../stores/useNodeStorage";

export default memo(({ data, isConnectable, id }) => {

  const link = process.env.REACT_APP_BACKEND_URL === 'http://localhost:8090' ? 'http://localhost:8090' : process.env.REACT_APP_BACKEND_URL

  const storageItems = useNodeStorage();

  return (
    <div style={{
      backgroundColor: '#555', 
      padding: '8px', 
      borderRadius: '8px',
      minWidth: "140px",
      maxWidth: "180px",
      width: "auto",
      position: "relative"
    }} >
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
        onConnect={(params) => console.log("handle onConnect", params)}
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
      <div style={{color: '#ededed', fontSize: '14px', flexDirection: 'row', display: 'flex', alignItems: 'center'}}>
        <Image sx={{width: '14px', height: '14px', marginRight: '4px'}}/>
        <div style={{color: '#ededed', fontSize: '14px', fontWeight: 500}}>
        Imagem
        </div>
      </div>
      <div style={{color: '#ededed', fontSize: '12px', width: '100%', maxWidth: '180px', marginTop: '4px'}}>
        <img src={`${link}/public/${data.url}`} style={{width: '100%', maxWidth: '180px', height: 'auto', borderRadius: '4px'}} />
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
