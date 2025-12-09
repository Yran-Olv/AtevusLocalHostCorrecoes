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

// Registrando o Service Worker com melhorias para PWA
if ('serviceWorker' in navigator) {
  let registrationInterval = null;

  window.addEventListener('load', async () => {
    // Aguardar um pouco para garantir que o LoadingScreen terminou de limpar
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const swUrl = `${window.location.origin}/serviceWorker.js`;

      // Verificar se o arquivo existe antes de registrar
      try {
        const response = await fetch(swUrl, { method: 'HEAD' });
        if (!response.ok) {
          console.warn('Service worker não encontrado, pulando registro');
          return;
        }
      } catch (error) {
        console.warn('Erro ao verificar service worker:', error);
        return;
      }

      // Tentar registrar (o navegador gerencia se já existe um)
      let registration;
      try {
        registration = await navigator.serviceWorker.register(swUrl, {
          scope: '/',
          updateViaCache: 'none' // Sempre buscar atualizações
        });
      } catch (registerError) {
        // Se já existe um registro, tentar obter o existente
        if (registerError.name === 'InvalidStateError' || registerError.message.includes('already registered')) {
          const existingRegistrations = await navigator.serviceWorker.getRegistrations();
          if (existingRegistrations.length > 0) {
            registration = existingRegistrations[0];
            console.log('Usando service worker já registrado');
          } else {
            throw registerError;
          }
        } else {
          throw registerError;
        }
      }

      console.log('Service worker registrado com sucesso!', registration);

      // Verificar atualizações periodicamente (a cada 5 minutos, não 1 minuto)
      registrationInterval = setInterval(() => {
        if (registration) {
          try {
            registration.update().catch((err) => {
              // Ignorar erros de atualização silenciosamente
              console.debug('Erro ao atualizar service worker (não crítico):', err);
            });
          } catch (err) {
            console.debug('Erro ao tentar atualizar service worker:', err);
          }
        }
      }, 300000); // A cada 5 minutos

      // Listener para atualizações do service worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Novo service worker disponível
              console.log('Novo service worker disponível');
              // Opcional: mostrar notificação para o usuário atualizar
            }
          });
        }
      });

      // Listener para mensagens do service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Mensagem do service worker:', event.data);
        
        if (event.data && event.data.type === 'SKIP_WAITING') {
          window.location.reload();
        }
      });

      // Solicitar permissão de notificação
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          console.log('Permissão de notificação:', permission);
        });
      }
    } catch (error) {
      // Tratar erros de forma mais robusta
      if (error.name === 'InvalidStateError' || error.message.includes('invalid state')) {
        console.warn('Service worker em estado inválido. Tentando limpar e re-registrar...');
        
        // Tentar limpar service workers existentes
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map(reg => reg.unregister()));
          
          // Aguardar um pouco antes de tentar registrar novamente
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (cleanupError) {
          console.error('Erro ao limpar service workers:', cleanupError);
        }
      } else {
        console.error('Erro durante o registro do service worker:', error);
      }
    }
  });

  // Limpar intervalo quando a página for descarregada
  window.addEventListener('beforeunload', () => {
    if (registrationInterval) {
      clearInterval(registrationInterval);
    }
  });
}
