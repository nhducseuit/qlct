import { PartialType } from '@nestjs/swagger';
import { CreatePredefinedSplitRatioDto } from './create-predefined-split-ratio.dto';

// UpdatePredefinedSplitRatioDto allows partial updates of the CreatePredefinedSplitRatioDto fields
export class UpdatePredefinedSplitRatioDto extends PartialType(CreatePredefinedSplitRatioDto) {
  // No additional fields needed here, PartialType handles making all fields optional
}