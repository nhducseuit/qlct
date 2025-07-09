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


  // payerId and payeeId filters removed: settlements are now filtered by accessible persons automatically

}