import { Module } from '@nestjs/common';
import { HouseholdMemberService } from './household-member.service';
import { HouseholdMemberController } from './household-member.controller';
// PrismaModule is global, so PrismaService is available.

@Module({
  controllers: [HouseholdMemberController], // We'll create this next
  providers: [HouseholdMemberService],
  exports: [HouseholdMemberService], // Export if needed by other modules
})
export class HouseholdMemberModule {}