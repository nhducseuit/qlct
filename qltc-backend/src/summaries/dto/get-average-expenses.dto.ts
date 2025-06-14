// src/summaries/dto/get-average-expenses.dto.ts
import { IsEnum, IsInt, IsOptional, Max, Min, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { PeriodType } from './get-totals-summary.dto'; // Reuse PeriodType

export class GetAverageExpensesQueryDto {
  @ApiProperty({
    enum: PeriodType,
    description: 'The type of period for the summary (monthly, quarterly, yearly).',
    example: PeriodType.Monthly,
  })
  @IsEnum(PeriodType)
  periodType!: PeriodType;

  @ApiPropertyOptional({
    type: Number,
    description: 'The year for the summary. Defaults to the current year.',
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
    description: 'The month for the summary (1-12). Used if periodType is monthly.',
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
    description: 'The quarter for the summary (1-4). Used if periodType is quarterly.',
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
    type: [String],
    description: 'Optional: Array of category IDs to filter expenses. If not provided, calculates for all expenses.',
    example: ['a1b2c3d4-e5f6-7890-1234-567890abcdef', 'b2c3d4e5-f6g7-8901-2345-67890abcdef0'],
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // Check if it's a JSON array-like string
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            // Ensure all elements are strings and filter out empty ones
            return parsed.map(String).filter(s => s && s.trim().length > 0).map(s => s.trim());
          }
        } catch (e) {
          // Not a valid JSON array string, fall through to comma-separated logic
        }
      }
      // Handle comma-separated string or a single string
      return value.split(',').map(item => String(item).trim()).filter(item => item.length > 0);
    }
    // If it's already an array (e.g., from NestJS parsing multiple query params like categoryIds=a&categoryIds=b)
    if (Array.isArray(value)) {
      return value.map(String).filter(s => s && s.trim().length > 0).map(s => s.trim());
    }
    return value; // Fallback
  })
  @IsArray()
  @IsUUID('all', { each: true, message: 'Each categoryId must be a valid UUID.' })
  categoryIds?: string[];
}