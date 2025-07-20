// d:\sources\qlct\qltc-app\src\models\settlement.ts

// Corresponds to Backend: src/settlements/dto/member-balance.dto.ts
export interface DetailedMemberBalanceDto {
  personOneId: string;
  memberOneName: string;
  personTwoId: string;
  memberTwoName: string;
  netAmountPersonOneOwesPersonTwo: number;
}

// Corresponds to Backend: src/settlements/dto/balances-response.dto.ts
export interface BalancesResponseDto {
  balances: DetailedMemberBalanceDto[];
}

// Corresponds to Backend: src/settlements/dto/create-settlement.dto.ts
export interface CreateSettlementDto {
  payerId: string;
  payeeId: string;
  amount: number;
  date: string; // ISO 8601 date string
  note?: string;
}

// Corresponds to Backend: src/settlements/dto/settlement.dto.ts
export interface SettlementPersonDto {
  personId: string;
  personName: string;
  membershipId: string;
}

export interface SettlementDto {
  id: string;
  amount: number;
  date: string; // ISO Date string
  note?: string | null;
  payer: SettlementPersonDto;
  payee: SettlementPersonDto;
  familyId: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

// Corresponds to Backend: src/settlements/dto/get-settlements-query.dto.ts
export interface GetSettlementsQueryDto {
  page?: number;
  limit?: number;
  payerMembershipId?: string;
  payeeMembershipId?: string;
  startDate?: string; // ISO 8601 date string
  endDate?: string; // ISO 8601 date string
}

// Corresponds to Backend: src/settlements/dto/get-balances-query.dto.ts
export interface GetBalancesQueryDto {
  personId?: string;
  untilDate?: string; // ISO 8601 date string (end-of-month)
}

// Corresponds to Backend: src/settlements/dto/paginated-settlements-response.dto.ts
export interface PaginationMetaDto {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedSettlementsResponseDto {
  items: SettlementDto[];
  meta: PaginationMetaDto;
}
