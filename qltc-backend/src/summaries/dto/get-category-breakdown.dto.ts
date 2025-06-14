// src/summaries/dto/get-category-breakdown.dto.ts
import { IsEnum, IsInt, IsOptional, Max, Min, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
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
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // Check if it's a JSON array-like string (e.g., "[\"id1\",\"id2\"]")
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          const parsed = JSON.parse(value);
          // Ensure all elements are strings and filter out empty/null ones
          if (Array.isArray(parsed)) return parsed.map(String).filter(s => s && String(s).trim().length > 0).map(s => String(s).trim());
        } catch (e) { /* fall through to comma-separated or single value logic */ }
      }
      // Handle comma-separated string or a single string value
      return value.split(',').map(item => String(item).trim()).filter(item => item.length > 0);
    }
    // If it's already an array (e.g., from NestJS parsing multiple query params like categoryIds=a&categoryIds=b)
    if (Array.isArray(value)) return value.map(String).filter(s => s && String(s).trim().length > 0).map(s => String(s).trim());
    return value; // Fallback, though typically it would be string or array
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
}