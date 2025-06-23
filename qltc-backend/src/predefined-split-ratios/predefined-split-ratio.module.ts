import { Module } from '@nestjs/common';
import { PredefinedSplitRatioService } from './predefined-split-ratio.service';
import { PredefinedSplitRatioController } from './predefined-split-ratio.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule], // Import NotificationsModule to make NotificationsGateway available
  controllers: [PredefinedSplitRatioController],
  providers: [PredefinedSplitRatioService], // PrismaService is available globally
  exports: [PredefinedSplitRatioService], // Export the service if needed elsewhere
})
export class PredefinedSplitRatioModule {}