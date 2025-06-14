// src/summaries/dto/get-member-breakdown.dto.ts
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PeriodType } from './get-totals-summary.dto'; // Reuse PeriodType

export class GetMemberBreakdownQueryDto {
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
    description: 'The month for the summary (1-12). Used if periodType is monthly and a specific month is desired.',
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
    description: 'The quarter for the summary (1-4). Used if periodType is quarterly and a specific quarter is desired.',
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
}