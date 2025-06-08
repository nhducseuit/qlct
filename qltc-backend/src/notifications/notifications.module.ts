import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
// import { AuthModule } from '../auth/auth.module'; // Import AuthModule nếu gateway cần AuthService

@Module({
  // imports: [AuthModule], // Uncomment nếu bạn inject AuthService vào gateway
  providers: [NotificationsGateway],
  exports: [NotificationsGateway], // Export gateway để các service khác có thể inject
})
export class NotificationsModule {}