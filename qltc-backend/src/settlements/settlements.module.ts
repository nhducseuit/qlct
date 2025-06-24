import { Module } from '@nestjs/common';
import { SettlementsController } from './settlements.controller';
import { SettlementsService } from './settlements.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule], // Add PrismaModule and NotificationsModule here
  controllers: [SettlementsController],
  providers: [SettlementsService]
})
export class SettlementsModule {}
