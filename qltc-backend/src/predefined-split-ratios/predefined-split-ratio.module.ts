import { Module } from '@nestjs/common';
import { PredefinedSplitRatioService } from './predefined-split-ratio.service';
import { PredefinedSplitRatioController } from './predefined-split-ratio.controller';
import { PrismaService } from '../prisma/prisma.service'; // Import PrismaService
import { NotificationsGateway } from '../notifications/notifications.gateway'; // Import NotificationsGateway

@Module({
  controllers: [PredefinedSplitRatioController],
  providers: [PredefinedSplitRatioService, PrismaService, NotificationsGateway], // Provide PrismaService and NotificationsGateway
  exports: [PredefinedSplitRatioService], // Export the service if needed elsewhere
})
export class PredefinedSplitRatioModule {}