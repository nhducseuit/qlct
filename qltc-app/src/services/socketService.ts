import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from 'src/stores/authStore';

let socketInstance: Socket | null = null;

// Promise that resolves with the socket instance once connected
let connectionPromise: Promise<Socket | null> | null = null;

export const getSocketInstance = (): Socket | null => socketInstance;

export const connect = (): Promise<Socket | null> => {
  // If a live socket is already connected, resolve immediately with it
  if (socketInstance?.connected) {
    return Promise.resolve(socketInstance);
  }

  // If a connection attempt is already in progress, return the existing promise
  if (connectionPromise) {
    console.log('[SocketService] Connection attempt already in progress. Returning existing promise.');
    return connectionPromise;
  }

  const authStore = useAuthStore();
  if (!authStore.isAuthenticated || !authStore.token) {
    console.warn('[SocketService] Connection skipped: User not authenticated or no token.');
    return Promise.resolve(null); // Resolve with null if no auth
  }

  // Create a new connection promise
  connectionPromise = new Promise((resolve) => {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    console.log(`[SocketService] Attempting to connect NEW socket instance to: ${backendUrl}`);

    // Clean up any existing, non-connected socket instance before creating a new one
    if (socketInstance && !socketInstance.connected) {
        console.log('[SocketService] Cleaning up stale, disconnected socket instance. Old ID was:', socketInstance.id);
        socketInstance.disconnect();
        socketInstance = null;
    }

    const newSocket = io(backendUrl, {
      auth: { token: authStore.token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    // Define event handlers
    const onConnect = () => {
      console.log('[SocketService] Socket connected successfully:', newSocket.id);
      socketInstance = newSocket;
      // connectionPromise is not reset here, subsequent calls will get the resolved promise or hit the socketInstance.connected check
      cleanUpListeners(); // Remove listeners after promise is resolved
      resolve(socketInstance);
    };

    const onDisconnect = (reason: Socket.DisconnectReason) => {
      console.log('[SocketService] Socket disconnected:', reason, 'Socket ID was:', newSocket.id);
      if (socketInstance === newSocket) {
        socketInstance = null;
      }
      connectionPromise = null; // Reset promise to allow new connection attempts
      cleanUpListeners();
      resolve(null);
    };

    const onConnectError = (error: Error) => {
      console.error('[SocketService] Socket connection error:', error.message, 'Attempted Socket ID was:', newSocket.id);
      if (socketInstance === newSocket) { // Only nullify if it's the current global socket
        socketInstance = null;
      }
      newSocket.disconnect(); // Ensure this specific socket attempt is cleaned up
      connectionPromise = null; // Reset promise to allow new connection attempts
      cleanUpListeners();
      resolve(null);
    };

    const cleanUpListeners = () => {
        newSocket.off('connect', onConnect);
        newSocket.off('disconnect', onDisconnect);
        newSocket.off('connect_error', onConnectError);
    };

    newSocket.on('connect', onConnect);
    newSocket.on('disconnect', onDisconnect);
    newSocket.on('connect_error', onConnectError);
  });

  return connectionPromise;
};

export const disconnect = (): void => {
  if (socketInstance) {
    console.log('[SocketService] Disconnecting socket by client request. ID:', socketInstance.id);
    socketInstance.disconnect();
    socketInstance = null;
  }
  connectionPromise = null; // Reset promise if a connection was in progress or established
};
