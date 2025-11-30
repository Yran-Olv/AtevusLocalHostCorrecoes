import React from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";

import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <CssBaseline>
    <App />
  </CssBaseline>
);

// Registrando o Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${window.location.origin}/serviceWorker.js`; // Usando o origin para o caminho

    navigator.serviceWorker.register(swUrl)
      .then((registration) => {
        console.log('Service worker registrado com sucesso!', registration);
      })
      .catch((error) => {
        console.error('Erro durante o registro do service worker:', error);
      });
  });
}
