import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHouseholdMemberDto {
  @ApiProperty({ description: 'Name of the household member', example: 'Chồng' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Whether the member is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiPropertyOptional({ description: 'Order for sorting members in lists' })
  @IsNumber()
  @IsOptional()
  order?: number;

  // userId will be set by the service based on the authenticated user,
  // so it's not part of the DTO received from the client.
}