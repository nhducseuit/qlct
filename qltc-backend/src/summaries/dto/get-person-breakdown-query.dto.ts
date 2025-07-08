import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsInt, Min, Max, IsArray, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PeriodType } from './period-type.enum';

export class GetPersonBreakdownQueryDto {
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

  @ApiPropertyOptional({
    description: "Filter transactions by type. If 'expense', only expenses are considered. If 'all' or omitted, all types are included.",
    enum: ['expense', 'all'],
  })
  @IsOptional()
  @IsString()
  transactionType?: 'expense' | 'all';
}
