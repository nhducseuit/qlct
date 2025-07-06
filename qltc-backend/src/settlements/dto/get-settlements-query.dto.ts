// src/settlements/dto/get-settlements-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min, IsDateString } from 'class-validator';

export class GetSettlementsQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination.',
    default: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page.',
    default: 10,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // Max limit to prevent abuse
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by payer household membership ID.',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  payerMembershipId?: string;

  @ApiPropertyOptional({
    description: 'Filter by payee household membership ID.',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  payeeMembershipId?: string;

  @ApiPropertyOptional({
    description: 'Filter by start date (ISO 8601 format).',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (ISO 8601 format).',
    example: '2023-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}