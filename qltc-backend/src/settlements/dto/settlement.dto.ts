// src/settlements/dto/settlement.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class SettlementMemberDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ description: 'Person details' })
  person!: { id: string; name: string };
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
  payerMembershipId!: string;

  @ApiProperty({ type: SettlementMemberDto, description: 'Details of the payer membership' })
  payer!: SettlementMemberDto;

  @ApiProperty()
  payeeMembershipId!: string;

  @ApiProperty({ type: SettlementMemberDto, description: 'Details of the payee membership' })
  payee!: SettlementMemberDto;

  @ApiProperty()
  familyId!: string;

  @ApiProperty()
  createdAt!: string; // ISO Date string

  @ApiProperty()
  updatedAt!: string; // ISO Date string
}