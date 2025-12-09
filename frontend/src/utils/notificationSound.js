// Utilitário para reproduzir som de notificação
// Funciona em Android, iOS e Desktop

let audioContext = null;
let notificationSound = null;

// Inicializar contexto de áudio
const initAudioContext = () => {
  if (!audioContext) {
    try {
      // Usar AudioContext ou webkitAudioContext para compatibilidade
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContextClass();
    } catch (e) {
      console.error('Erro ao criar AudioContext:', e);
      return null;
    }
  }
  return audioContext;
};

// Criar som de notificação sintético (fallback se não houver arquivo)
const createNotificationTone = (audioContext) => {
  if (!audioContext) return null;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Frequência tipo WhatsApp (800Hz)
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';

  // Envelope de volume (fade in/out)
  const now = audioContext.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

  oscillator.start(now);
  oscillator.stop(now + 0.3);

  return oscillator;
};

// Reproduzir som de notificação
export const playNotificationSound = async (soundUrl = null) => {
  try {
    // Tentar usar arquivo de áudio primeiro
    if (soundUrl) {
      try {
        const audio = new Audio(soundUrl);
        audio.volume = 0.5;
        await audio.play();
        return;
      } catch (e) {
        console.warn('Erro ao reproduzir arquivo de áudio, usando sintético:', e);
      }
    }

    // Fallback: usar som sintético
    const context = initAudioContext();
    if (!context) {
      console.warn('AudioContext não disponível');
      return;
    }

    // Se o contexto estiver suspenso (comum em mobile), resume
    if (context.state === 'suspended') {
      await context.resume();
    }

    createNotificationTone(context);
  } catch (error) {
    console.error('Erro ao reproduzir som de notificação:', error);
  }
};

// Reproduzir som de notificação com vibração (mobile)
export const playNotificationWithVibration = async (soundUrl = null) => {
  // Vibrar se suportado
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch (e) {
      console.warn('Erro ao vibrar:', e);
    }
  }

  // Reproduzir som
  await playNotificationSound(soundUrl);
};

// Listener para mensagens do Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PLAY_NOTIFICATION_SOUND') {
      playNotificationWithVibration(event.data.sound);
    }
  });
}

