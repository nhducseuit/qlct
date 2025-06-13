import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum PeriodType {
  Monthly = 'monthly',
  Quarterly = 'quarterly',
  Yearly = 'yearly',
}

export class GetTotalsSummaryQueryDto {
  @ApiProperty({
    enum: PeriodType,
    description: 'The type of period for the summary.',
    example: PeriodType.Monthly,
  })
  @IsEnum(PeriodType, {
    message: `periodType must be one of the following values: ${Object.values(PeriodType).join(', ')}`,
  })
  periodType!: PeriodType;

  @ApiPropertyOptional({
    type: Number,
    description: 'The year for the summary. Defaults to the current year if not provided for monthly/quarterly summaries.',
    example: 2023,
    minimum: 1900,
    maximum: 2100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number; // e.g., 2023. Defaults to current year if not provided for monthly/quarterly.
}