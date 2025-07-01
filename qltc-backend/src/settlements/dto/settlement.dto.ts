// src/settlements/dto/settlement.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class SettlementMemberDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}
export class SettlementDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  date!: string; // ISO Date string

  @ApiProperty({ nullable: true })
  note?: string | null;

  @ApiProperty()
  payerId!: string;

  @ApiProperty({ type: SettlementMemberDto, description: 'Details of the payer' })
  payer!: SettlementMemberDto;

  @ApiProperty()
  payeeId!: string;

  @ApiProperty({ type: SettlementMemberDto, description: 'Details of the payee' })
  payee!: SettlementMemberDto;

  // userId removed: not present in new schema
  @ApiProperty()
  familyId!: string;

  @ApiProperty()
  createdAt!: string; // ISO Date string

  @ApiProperty()
  updatedAt!: string; // ISO Date string
}