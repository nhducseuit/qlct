import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from 'src/stores/authStore';
import { Notify } from 'quasar'; // Import Notify for user feedback

let socketInstance: Socket | null = null;

// Promise that resolves with the socket instance once connected
let connectionPromise: Promise<Socket | null> | null = null;

export const getSocketInstance = (): Socket | null => socketInstance;

export const connect = (): Promise<Socket | null> => {
  const authStore = useAuthStore();
  const token = authStore.token;

  // 1. Check if we can reuse an existing socket or if we need to disconnect a stale one.
  if (socketInstance?.connected) {
    // The `auth` property can be an object or a function. We only care about the object case.
    if (typeof socketInstance.auth === 'object' && socketInstance.auth.token === token) {
      console.log('[SocketService] Returning existing connected socketInstance. ID:', socketInstance.id);
      return Promise.resolve(socketInstance);
    } else {
      disconnect(); // Disconnect stale socket (e.g., from a previous user)
    }
  }

  // If a connection attempt is already in progress, return the existing promise
  if (connectionPromise) {
    console.log('[SocketService] Connection attempt already in progress. Returning existing promise.');
    return connectionPromise;
  }

  // 2. Check authentication before attempting connection
  if (!authStore.isAuthenticated || !authStore.token) {
    console.warn('[SocketService] connect() skipped: User not authenticated or no token. Resolving promise with null.');
    // Ensure any stale socket is disconnected if no token
    if (socketInstance && socketInstance.connected) {
      socketInstance.disconnect();
    }
    socketInstance = null;
    return Promise.resolve(null); // Resolve with null if no auth
  }

  // 3. If socket exists but is disconnected or has an old token, disconnect it
  if (socketInstance && (socketInstance.connected || socketInstance.disconnected)) {
    console.log('[SocketService] Disconnecting old or stale socket instance.');
    socketInstance.disconnect();
    socketInstance = null;
  }

  // 4. Create a new connection promise
  connectionPromise = new Promise((resolve, reject) => {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    console.log(`[SocketService] Attempting to connect NEW socket instance to: ${backendUrl}`);

    const newSocket = io(backendUrl, {
      auth: { token: token },
      transports: ['websocket', 'polling'], // Prefer WebSocket, fallback to polling
      reconnectionAttempts: 5, // Number of reconnection attempts
      reconnectionDelay: 1000, // How long to wait before attempting a new reconnect
      timeout: 20000, // Connection timeout
    });

    // --- Event Handlers for the newSocket instance ---
    const onConnect = () => {
      console.log(`[SocketService] Socket connected: ${newSocket.id}`);
      socketInstance = newSocket;
      Notify.create({
        type: 'positive',
        message: 'Kết nối thời gian thực đã được thiết lập.',
        position: 'top',
        timeout: 1500,
      });
      resolve(socketInstance);
    };

    const onDisconnect = (reason: Socket.DisconnectReason) => {
      console.warn(`[SocketService] Socket disconnected: ${reason}`);
      Notify.create({
        type: 'warning',
        message: `Kết nối thời gian thực bị ngắt: ${reason}`,
        position: 'top',
        timeout: 2000,
      });

      // Handle specific disconnect reasons, e.g., auth expiration
      if (reason === 'io server disconnect' && authStore.isAuthenticated) { // If server initiated disconnect and we were authenticated
        console.log('[SocketService] Server-side auth disconnect detected. Clearing auth data.');
        authStore.clearAuthData(); // This will trigger re-initialization of stores and redirect
        Notify.create({
          type: 'negative',
          message: 'Phiên kết nối thời gian thực đã hết hạn. Vui lòng đăng nhập lại.',
          position: 'top',
          timeout: 3000,
        });
      }

      // Clear global socket and promise on disconnect
      if (socketInstance === newSocket) socketInstance = null; // Only clear if it's the current active socket
      connectionPromise = null; // Reset promise to allow new connection attempts
      // If the promise was still pending, reject it. Otherwise, it's already resolved/rejected.
      if (newSocket.listeners('connect').length > 0) { // Check if initial connect listener is still active
        reject(new Error(`WebSocket disconnected during connection attempt: ${reason}`));
      }
    };

    const onConnectError = (error: Error) => {
      console.error('[SocketService] Socket connection error:', error.message, 'Attempted Socket ID was:', newSocket.id);
      Notify.create({
        type: 'negative',
        message: `Lỗi kết nối thời gian thực: ${error.message}`,
        position: 'top',
        timeout: 3000,
      });
      if (socketInstance === newSocket) socketInstance = null; // Only clear if it's the current active socket
      connectionPromise = null; // Reset promise to allow new connection attempts
      newSocket.disconnect(); // Ensure this specific socket attempt is cleaned up
      reject(new Error(`WebSocket connection failed: ${error.message}`)); // Reject the connection promise
    };

    const onReconnectAttempt = (attemptNumber: number) => {
      console.log(`[SocketService] Reconnection attempt: ${attemptNumber}`);
    };

    const onReconnectError = (err: Error) => {
      console.error(`[SocketService] Reconnection error: ${err.message}`);
      Notify.create({
        type: 'negative',
        message: `Lỗi kết nối lại thời gian thực: ${err.message}`,
        position: 'top',
        timeout: 3000,
      });
    };

    const onReconnectFailed = () => {
      console.error('[SocketService] Reconnection failed. Please check network or server.');
      Notify.create({
        type: 'negative',
        message: 'Không thể kết nối lại thời gian thực. Vui lòng kiểm tra mạng.',
        position: 'top',
        timeout: 5000,
      });
    };

    // Attach event handlers
    newSocket.on('connect', onConnect);
    newSocket.on('disconnect', onDisconnect);
    newSocket.on('connect_error', onConnectError);
    newSocket.on('reconnect_attempt', onReconnectAttempt);
    newSocket.on('reconnect_error', onReconnectError);
    newSocket.on('reconnect_failed', onReconnectFailed);
  });

  return connectionPromise;
};

export const disconnect = (): void => {
  if (socketInstance) {
    console.log('[SocketService] Explicitly disconnecting socketInstance. ID:', socketInstance.id);
    socketInstance.disconnect();
    socketInstance = null;
  } else {
    console.log('[SocketService] disconnect() called, but no active socketInstance to disconnect.');
  }
  connectionPromise = null; // Reset promise to allow new connection attempts
};
