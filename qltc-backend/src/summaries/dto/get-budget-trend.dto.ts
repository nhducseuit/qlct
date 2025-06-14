// src/summaries/dto/get-budget-trend.dto.ts
import { IsEnum, IsInt, IsOptional, Max, Min, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { PeriodType } from './get-totals-summary.dto'; // Reuse PeriodType

export class GetBudgetTrendQueryDto {
  @ApiProperty({
    enum: PeriodType, // Will likely be 'monthly' for trends within a year, or 'yearly' for year-over-year
    description: 'The granularity of the trend periods (e.g., monthly for a year, or yearly for multiple years).',
    example: PeriodType.Monthly,
  })
  @IsEnum(PeriodType)
  periodType!: PeriodType; // e.g., 'monthly' to get data for each month of 'year'

  @ApiProperty({
    type: Number,
    description: 'The primary year for the trend. If periodType is monthly, shows months of this year.',
    example: 2023,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  year!: number;

  // Could add startYear/endYear if periodType is 'yearly' for a multi-year trend

  @ApiPropertyOptional({
    type: [String],
    description: 'Optional: Array of category IDs to filter. If not provided, considers all categories with budgets.',
    example: ['a1b2c3d4-e5f6-7890-1234-567890abcdef'],
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => { // Reusing the robust transform from average-expenses
    if (typeof value === 'string') {
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) return parsed.map(String).filter(s => s && s.trim().length > 0).map(s => s.trim());
        } catch (e) { /* fall through */ }
      }
      return value.split(',').map(item => String(item).trim()).filter(item => item.length > 0);
    }
    if (Array.isArray(value)) return value.map(String).filter(s => s && s.trim().length > 0).map(s => s.trim());
    return value;
  })
  @IsArray()
  @IsUUID('all', { each: true, message: 'Each categoryId must be a valid UUID.' })
  categoryIds?: string[];
}