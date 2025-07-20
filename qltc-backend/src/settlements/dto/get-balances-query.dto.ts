

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';

export class GetBalancesQueryDto {
  @ApiPropertyOptional({
    description: 'Person 1 ID (required)',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  personOneId?: string;

  @ApiPropertyOptional({
    description: 'Person 2 ID (required)',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  personTwoId?: string;

  @ApiPropertyOptional({
    description: 'Year for balance calculation (defaults to current year if not set)',
    type: Number,
    example: 2025,
  })
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({
    description: 'Month for balance calculation (1-12, defaults to current month if not set)',
    type: Number,
    example: 7,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}
