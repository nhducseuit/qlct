// src/settlements/dto/create-settlement.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateSettlementDto {
  @ApiProperty({ description: 'ID of the payer household membership.', example: 'uuid-for-payer-membership' })
  @IsNotEmpty()
  @IsUUID()
  payerMembershipId!: string;

  @ApiProperty({ description: 'ID of the payee household membership.', example: 'uuid-for-payee-membership' })
  @IsNotEmpty()
  @IsUUID()
  payeeMembershipId!: string;

  @ApiProperty({ description: 'Amount of the settlement.', example: 50.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01, { message: 'Settlement amount must be greater than 0.' })
  amount!: number;

  @ApiProperty({ description: 'Date of the settlement (ISO 8601 format).', example: '2023-10-26T10:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  date!: string; // Will be converted to Date object in service

  @ApiPropertyOptional({ description: 'Optional note for the settlement.', example: 'Settled for last month dinner' })
  @IsOptional()
  @IsString()
  note?: string;
}