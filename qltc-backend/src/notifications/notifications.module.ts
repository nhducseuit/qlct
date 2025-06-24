import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule

@Module({
  imports: [AuthModule], // Import AuthModule to get access to JwtService (which is provided by AuthModule)
  providers: [NotificationsGateway],
  exports: [NotificationsGateway], // Export gateway để các service khác có thể inject
})
export class NotificationsModule {}