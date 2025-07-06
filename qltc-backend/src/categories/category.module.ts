import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { FamilyModule } from '../families/family.module';

@Module({
  imports: [NotificationsModule, FamilyModule], // Import NotificationsModule and FamilyModule
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService], // Export if other modules need it
})
export class CategoryModule {}
