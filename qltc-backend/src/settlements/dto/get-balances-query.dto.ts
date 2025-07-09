import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class GetBalancesQueryDto {
  @ApiPropertyOptional({
    description: 'Person ID to get balances for (required for person-centric balances)',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  personId?: string;
}
