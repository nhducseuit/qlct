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
import { PredefinedSplitRatioModule } from './predefined-split-ratios/predefined-split-ratio.module'; // Import the new module
import { SummariesModule } from './summaries/summaries.module';
import { SettlementsModule } from './settlements/settlements.module';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule
    ,UserModule
    ,CategoryModule
    ,TransactionModule
    ,NotificationsModule
    ,PrismaModule
    ,HouseholdMemberModule
    ,PredefinedSplitRatioModule
    ,SummariesModule, SettlementsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}