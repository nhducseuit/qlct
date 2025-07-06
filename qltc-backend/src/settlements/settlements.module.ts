import { Module } from '@nestjs/common';
import { SettlementsController } from './settlements.controller';
import { SettlementsService } from './settlements.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { FamilyModule } from '../families/family.module';

@Module({
  imports: [PrismaModule, NotificationsModule, FamilyModule], // Add FamilyModule
  controllers: [SettlementsController],
  providers: [SettlementsService],
})
export class SettlementsModule {}
