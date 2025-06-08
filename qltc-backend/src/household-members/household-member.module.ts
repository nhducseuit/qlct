import { Module } from '@nestjs/common';
import { HouseholdMemberService } from './household-member.service';
import { HouseholdMemberController } from './household-member.controller';
import { NotificationsModule } from '../notifications/notifications.module';
// PrismaModule is global, so PrismaService is available.

@Module({
  imports: [NotificationsModule], // Import NotificationsModule
  controllers: [HouseholdMemberController],
  providers: [HouseholdMemberService],
  exports: [HouseholdMemberService], // Export if needed by other modules
})
export class HouseholdMemberModule {}
