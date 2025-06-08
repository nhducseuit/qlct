import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
// Giả sử bạn có một AuthService để xác thực token
// import { AuthService } from '../auth/auth.service'; // Điều chỉnh đường dẫn nếu cần

interface AuthenticatedSocket extends Socket {
  user?: { id: string; /* các thông tin user khác */ }; // Định nghĩa user sau khi xác thực
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || ['http://localhost', 'http://192.168.1.165', 'http://localhost:9000'], // URL của frontend Quasar
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // path: '/socket.io', // Mặc định là /socket.io
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private logger: Logger = new Logger('NotificationsGateway');

  // Inject AuthService nếu bạn có
  // constructor(private readonly authService: AuthService) {}

  async handleConnection(client: AuthenticatedSocket, ...args: any[]) {
    this.logger.log(`Client attempting to connect: ${client.id}`);
    try {
    let userIdForRoom = 'unknown_user';
    const token = client.handshake.auth?.token; // Token might not be sent from frontend now

    // Check if running in a development-like environment
    // NODE_ENV is typically 'development' for `npm run start:dev`
    const isDevEnvironment = process.env.NODE_ENV !== 'production';

    if (token) {
      // If token is provided (e.g., frontend still sends the mock dev-token)
      // TODO: Proper token validation for production
      if (token.startsWith('dev-token-')) {
        userIdForRoom = token.substring('dev-token-'.length); // Extracts everything after 'dev-token-'
      } else {
        userIdForRoom = 'user-from-token'; // Placeholder for actual token parsing
      }
    } else if (isDevEnvironment) {
      // If no token and in DEV, assign a default dev user
      this.logger.warn(`No token provided by client ${client.id}. Assigning default dev-user in DEV mode.`);
      userIdForRoom = 'dev-user';
    } else {
      // No token and not in DEV (or stricter DEV setup)
      throw new UnauthorizedException('No token provided for WebSocket connection.');
    }

    client.user = { id: userIdForRoom };

      if (client.user && client.user.id) {
        client.join(client.user.id); // Cho client join vào room theo userId
        this.logger.log(
          `Client ${client.id} (User: ${client.user.id}) connected and joined room ${client.user.id}`,
        );
      } else {
        throw new UnauthorizedException('User could not be identified from token');
      }
    } catch (error) {
      let errorMessage = 'An unknown error occurred during WebSocket connection';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      this.logger.error(`Connection failed for client ${client.id}: ${errorMessage}`);
      client.disconnect(true); // Ngắt kết nối nếu xác thực thất bại
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id} (User: ${client.user?.id})`);
  }

  // Phương thức này sẽ được gọi từ các service khác để gửi thông báo
  sendToUser(userId: string, event: string, data: any) {
    this.logger.log(
      `Sending event '${event}' to user room '${userId}' with data:`,
      data,
    );
    this.server.to(userId).emit(event, data);
  }

  // Ví dụ một message handler (nếu client cần gửi gì đó lên server)
  @SubscribeMessage('messageToServer')
  handleMessage(@MessageBody() data: string, @ConnectedSocket() client: AuthenticatedSocket): void {
    this.logger.log(`Message from client ${client.id} (User: ${client.user?.id}): ${data}`);
    // this.server.to(client.user.id).emit('messageToClient', `Server received: ${data}`);
  }
}