/**
 * Helper function to safely use socket methods
 * Verifies if socket exists and has the required method before calling it
 */

export const isSocketValid = (socket) => {
  return socket && 
         typeof socket === 'object' && 
         Object.keys(socket).length > 0 &&
         typeof socket.on === 'function';
};

export const safeSocketOn = (socket, event, callback) => {
  if (isSocketValid(socket)) {
    socket.on(event, callback);
    return true;
  }
  console.warn(`Socket is not valid, cannot listen to event: ${event}`);
  return false;
};

export const safeSocketOff = (socket, event, callback) => {
  if (isSocketValid(socket)) {
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
    return true;
  }
  return false;
};

export const safeSocketEmit = (socket, event, data) => {
  if (isSocketValid(socket)) {
    socket.emit(event, data);
    return true;
  }
  console.warn(`Socket is not valid, cannot emit event: ${event}`);
  return false;
};

