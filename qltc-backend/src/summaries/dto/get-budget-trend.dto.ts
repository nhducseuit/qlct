// src/summaries/dto/get-budget-trend.dto.ts
import { IsEnum, IsInt, IsOptional, Max, Min, IsUUID, IsArray, IsString, IsIn, IsBoolean } from 'class-validator';
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

  @ApiPropertyOptional({
    type: [String],
    description: 'Optional: Array of household member IDs to filter expenses. If not provided, considers expenses related to all members.',
    example: ['member-uuid-1', 'member-uuid-2'],
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => { // Reusing the robust transform
    if (typeof value === 'string') {
      if (value.startsWith('[') && value.endsWith(']')) {
        try { const parsed = JSON.parse(value); if (Array.isArray(parsed)) return parsed.map(String).filter(s => s && s.trim().length > 0).map(s => s.trim()); } catch (e) { /* fall through */ }
      }
      return value.split(',').map(item => String(item).trim()).filter(item => item.length > 0);
    }
    if (Array.isArray(value)) return value.map(String).filter(s => s && s.trim().length > 0).map(s => s.trim());
    return value;
  })
  @IsArray()
  @IsUUID('all', { each: true, message: 'Each memberId must be a valid UUID.' })
  memberIds?: string[];

  @ApiPropertyOptional({
    description: "Filter transactions by type. If 'expense', only expenses are considered. If 'all' or omitted, all types are included. For budget trend, this primarily affects 'actualExpenses'.",
    enum: ['expense', 'all'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['expense', 'all'])
  transactionType?: 'expense' | 'all';

  @ApiPropertyOptional({
    type: Boolean,
    description: "Optional: Apply strict mode filtering for members. Send 'true' or 'false' as a string. If true, only transactions where ALL selected members participated are included, and only their share of the amount is counted.",
  })
  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'], {
    message: "isStrictMode must be either 'true' or 'false'",
  })
  isStrictMode?: string; // Changed to string
}