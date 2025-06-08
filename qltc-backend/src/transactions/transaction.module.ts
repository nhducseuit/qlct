import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { CategoryModule } from '../categories/category.module'; // Import CategoryModule to use CategoryService
import { HouseholdMemberModule } from '../household-members/household-member.module'; // Import HouseholdMemberModule
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule, CategoryModule, HouseholdMemberModule], // Add HouseholdMemberModule
  controllers: [TransactionController],
  providers: [TransactionService],
  // exports: [TransactionService]
})
export class TransactionModule {}