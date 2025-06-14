// src/summaries/dto/get-category-breakdown.dto.ts
import { IsEnum, IsInt, IsOptional, Max, Min, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PeriodType } from './get-totals-summary.dto'; // Reuse PeriodType

export class GetCategoryBreakdownQueryDto {
  @ApiProperty({
    enum: PeriodType,
    description: 'The type of period for the summary (monthly, quarterly, yearly).',
    example: PeriodType.Monthly,
  })
  @IsEnum(PeriodType)
  periodType!: PeriodType;

  @ApiPropertyOptional({
    type: Number,
    description: 'The year for the summary. Defaults to the current year if not provided.',
    example: 2023,
    minimum: 1900,
    maximum: 2100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'The month for the summary (1-12). Required if periodType is monthly and a specific month is desired.',
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'The quarter for the summary (1-4). Required if periodType is quarterly and a specific quarter is desired.',
    example: 1,
    minimum: 1,
    maximum: 4,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  quarter?: number;

  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    description: 'Optional: ID of a parent category to get breakdown for its subcategories. If not provided, gets breakdown for top-level categories.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsOptional()
  @IsUUID()
  parentCategoryId?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Optional: Array of category IDs to filter the breakdown. If not provided, shows all applicable categories.',
    example: ['a1b2c3d4-e5f6-7890-1234-567890abcdef'],
    isArray: true,
  })
  @IsOptional()
  // @Transform not strictly needed here if class-transformer handles array query params well,
  // but can be added for robustness like in other DTOs if issues arise.
  // For now, relying on ValidationPipe's enableImplicitConversion for arrays.
  // If using Transform, ensure it's imported: import { Transform } from 'class-transformer';
  // @Transform(({ value }) => { ... })
  @IsArray()
  @IsUUID('all', { each: true, message: 'Each categoryId must be a valid UUID.' })
  categoryIds?: string[];
}