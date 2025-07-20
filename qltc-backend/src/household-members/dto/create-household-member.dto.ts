import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHouseholdMemberDto {
  @ApiProperty({ description: 'Family ID to add the member to', example: 'uuid-of-family' })
  @IsString()
  @IsNotEmpty()
  familyId!: string;
  @ApiProperty({ description: 'Person ID (required)', example: 'uuid-of-person' })
  @IsString()
  @IsNotEmpty()
  personId!: string;

  @ApiPropertyOptional({ description: 'Whether the member is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiPropertyOptional({ description: 'Order for sorting members in lists' })
  @IsNumber()
  @IsOptional()
  order?: number;
}