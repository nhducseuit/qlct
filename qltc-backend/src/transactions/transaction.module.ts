import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { CategoryModule } from '../categories/category.module'; // Import CategoryModule to use CategoryService
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule, CategoryModule],
  controllers: [TransactionController],
  providers: [TransactionService],
  // exports: [TransactionService]
})
export class TransactionModule {}