import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  IsHexColor,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // Optional
import { SplitRatioItemDto } from './split-ratio-item.dto';
import { IsSplitRatioSum100Constraint } from './validators/is-split-ratio-sum-100.validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Name of the category', example: 'Ăn uống' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'ID of the parent category if this is a sub-category', example: 'uuid-parent' })
  @IsString()
  @IsOptional()
  parentId?: string | null;

  @ApiPropertyOptional({ description: 'Icon name from Tabler Icons', example: 'ti-tools-kitchen-2' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: 'Hex color code for the category', example: '#FF5733' })
  @IsHexColor()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Whether the category is pinned for quick access', default: false })
  @IsBoolean()
  @IsOptional()
  isPinned?: boolean = false;

  @ApiPropertyOptional({ description: 'Order for sorting categories' })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ description: 'Whether the category is hidden', default: false })
  @IsBoolean()
  @IsOptional()
  isHidden?: boolean = false;

  @ApiPropertyOptional({
    description: 'Default split ratio for shared expenses in this category. Sum of percentages must be 100.',
    type: [SplitRatioItemDto],
    example: [{ memberId: 'uuid-chong', percentage: 60 }, { memberId: 'uuid-vo', percentage: 40 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(0) // Allows empty array if not shared or no default
  @Type(() => SplitRatioItemDto)
  @Validate(IsSplitRatioSum100Constraint, {
    message: 'The sum of percentages in defaultSplitRatio must be 100 if the array is not empty.',
  })
  @IsOptional()
  defaultSplitRatio?: SplitRatioItemDto[] = [];

  @ApiPropertyOptional({ description: 'Budget limit for this category', example: 5000000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  budgetLimit?: number | null;

  // userId will be set by the service based on the authenticated user,
  // so it's not part of the DTO received from the client.
}