import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from 'src/stores/authStore';

let socket: Socket | null = null;

export const getSocket = (): Socket | null => socket;

export const connectSocket = (): Socket | null => {
  const authStore = useAuthStore();
  if (socket && socket.connected) {
    // console.log('Socket already connected.');
    return socket;
  }

  if (authStore.isAuthenticated && authStore.token) {
    // Thay thế bằng URL backend NestJS của bạn, thường là URL gốc.
    // Socket.IO client sẽ tự động thử kết nối WebSocket.
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    console.log(`Attempting to connect socket to: ${backendUrl}`);
    socket = io(backendUrl, {
      // Gửi token để backend xác thực và join room
      auth: {
        token: authStore.token,
      },
      transports: ['websocket'], // Ưu tiên WebSocket
    });

    socket.on('connect', () => {
      console.log('Socket connected successfully:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      // Có thể cần logic retry hoặc thông báo cho người dùng
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return socket;
  } else {
    console.warn('Socket connection skipped: User not authenticated or no token.');
    return null;
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected by client.');
  }
};
