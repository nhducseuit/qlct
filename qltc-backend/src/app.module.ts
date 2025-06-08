import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { CategoryModule } from './categories/category.module'; // Import CategoryModule
import { TransactionModule } from './transactions/transaction.module'; // Import TransactionModule
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { HouseholdMemberModule } from './household-members/household-member.module';

@Module({
  imports: [
    AuthModule
    ,UserModule
    ,CategoryModule
    ,TransactionModule
    ,NotificationsModule
    ,PrismaModule
    ,HouseholdMemberModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}