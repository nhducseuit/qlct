// src/settlements/dto/create-settlement.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateSettlementDto {
  @ApiProperty({ description: 'ID of the payer person.', example: 'uuid-for-payer-person' })
  @IsNotEmpty()
  @IsUUID()
  payerId!: string;

  @ApiProperty({ description: 'ID of the payee person.', example: 'uuid-for-payee-person' })
  @IsNotEmpty()
  @IsUUID()
  payeeId!: string;

  @ApiProperty({ description: 'Amount of the settlement.', example: 50.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01, { message: 'Settlement amount must be greater than 0.' })
  amount!: number;


  @ApiPropertyOptional({ description: 'Settlement date (ISO 8601 string)', example: '2025-07-11T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Optional note for the settlement.', example: 'Settled for last month dinner' })
  @IsOptional()
  @IsString()
  note?: string;
}