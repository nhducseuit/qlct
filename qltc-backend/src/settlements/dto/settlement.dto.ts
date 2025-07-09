// src/settlements/dto/settlement.dto.ts
// DTOs for person-centric settlements
export class CreateSettlementDto {
  payerId!: string;   // Person who paid
  payeeId!: string;   // Person who received
  amount!: number;    // Amount settled
  note?: string;
}

export class SettlementDto {
  id!: string;
  payerId!: string;
  payeeId!: string;
  amount!: number;
  note?: string;
  createdAt!: string;
  createdBy!: string;
}
// removed stray bracket