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
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from '../auth/interfaces/user-payload.interface';
// Giả sử bạn có một AuthService để xác thực token
// import { AuthService } from '../auth/auth.service'; // Điều chỉnh đường dẫn nếu cần

interface AuthenticatedSocket extends Socket {
  user?: UserPayload;
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

  private readonly logger: Logger = new Logger('NotificationsGateway');

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket, ...args: any[]) {
    this.logger.log(`Client attempting to connect: ${client.id}`);
    try {
      const token = client.handshake.auth?.token;

      if (!token) {
        throw new UnauthorizedException('No token provided for WebSocket connection.');
      }

      // Verify the token and extract the payload
      const payload: UserPayload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET, // Ensure this matches your auth module's secret
      });

      if (!payload || !payload.id || !payload.email) { // Ensure all required UserPayload fields are present
        throw new UnauthorizedException('Invalid token payload or missing user ID/email.');
      }

      // Attach user payload to the socket instance for later use
      client.user = payload;

      // Join the user-specific room using the actual user ID from the token
      client.join(payload.id);
      this.logger.log(`Client ${client.id} (User: ${payload.id}) connected and joined room ${payload.id}`);
    } catch (error) {
      let errorMessage = 'An unknown error occurred during WebSocket connection';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      this.logger.error(`Connection failed for client ${client.id}: ${errorMessage}`);
      client.disconnect(true); // Disconnect on failure
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