// src/transactions/dto/get-transactions-query.dto.ts
import { IsEnum, IsInt, IsOptional, Max, Min, IsUUID, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { PeriodType } from '../../summaries/dto/get-totals-summary.dto'; // Reusing PeriodType

export class GetTransactionsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by Category ID.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    enum: PeriodType,
    description: 'The type of period for filtering (monthly, quarterly, yearly). If provided, year is required.',
  })
  @IsOptional()
  @IsEnum(PeriodType)
  periodType?: PeriodType;

  @ApiPropertyOptional({
    type: Number,
    description: 'The year for the period filter. Required if periodType is set.',
    example: 2023,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'The month for the period filter (1-12). Used if periodType is monthly.',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'The quarter for the period filter (1-4). Used if periodType is quarterly.',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  quarter?: number;

  // Optional: Direct date range filtering if periodType is not used
  @ApiPropertyOptional({ description: 'Start date for range filter (ISO Date String).', example: '2023-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for range filter (ISO Date String).', example: '2023-01-31T23:59:59.999Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Optional: Array of household member IDs to filter transactions (e.g., by payer or involved in split).',
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.split(',').map(item => String(item).trim()).filter(item => item.length > 0);
    if (Array.isArray(value)) return value.map(String).filter(s => s && String(s).trim().length > 0).map(s => String(s).trim());
    return value;
  })
  @IsArray()
  @IsUUID('all', { each: true, message: 'Each memberId must be a valid UUID.' })
  memberIds?: string[];
}