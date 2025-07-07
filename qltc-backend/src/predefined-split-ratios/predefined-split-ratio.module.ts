import { Module } from '@nestjs/common';
import { PredefinedSplitRatioService } from './predefined-split-ratio.service';
import { PredefinedSplitRatioController } from './predefined-split-ratio.controller';
import { NotificationsModule } from '../notifications/notifications.module';

import { FamilyModule } from '../families/family.module';

@Module({
  imports: [NotificationsModule, FamilyModule],
  controllers: [PredefinedSplitRatioController],
  providers: [PredefinedSplitRatioService],
  exports: [PredefinedSplitRatioService],
})
export class PredefinedSplitRatioModule {}