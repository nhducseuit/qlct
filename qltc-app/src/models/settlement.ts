// d:\sources\qlct\qltc-app\src\models\settlement.ts

// Corresponds to Backend: src/settlements/dto/member-balance.dto.ts
export interface MemberBalanceDto {
  memberId: string;
  memberName: string;
  amount: number;
}

export interface DetailedMemberBalanceDto {
  memberOneId: string;
  memberOneName: string;
  memberTwoId: string;
  memberTwoName: string;
  netAmountMemberOneOwesMemberTwo: number;
}

// Corresponds to Backend: src/settlements/dto/balances-response.dto.ts
export interface BalancesResponseDto {
  balances: DetailedMemberBalanceDto[];
  // userPerspectiveBalances?: MemberBalanceDto[]; // Optional, if added later
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
export interface SettlementMemberDto {
  id: string;
  name: string;
}

export interface SettlementDto {
  id: string;
  amount: number;
  date: string; // ISO Date string
  note?: string | null;
  payerId: string;
  payer: SettlementMemberDto;
  payeeId: string;
  payee: SettlementMemberDto;
  userId: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

// Corresponds to Backend: src/settlements/dto/get-settlements-query.dto.ts
export interface GetSettlementsQueryDto {
  page?: number;
  limit?: number;
  payerId?: string;
  payeeId?: string;
  startDate?: string; // ISO 8601 date string
  endDate?: string; // ISO 8601 date string
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
