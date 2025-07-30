// Matches PeriodType enum from backend
export enum PeriodType {
  Monthly = 'monthly',
  Quarterly = 'quarterly',
  Yearly = 'yearly',
}

// Matches GetTotalsSummaryQueryDto from backend
export interface GetTotalsSummaryQueryDto {
  periodType: PeriodType;
  year?: number;
  transactionType?: 'expense' | 'all';
}

// Matches PeriodSummaryDto from backend
export interface PeriodSummaryDto {
  period: string;
  totalIncome: number;
  totalExpense: number;
  netChange: number;
}

export type TotalsSummaryResponseDto = PeriodSummaryDto[];

// Matches GetCategoryBreakdownQueryDto from backend
export interface GetCategoryBreakdownQueryDto {
  periodType: PeriodType;
  year?: number;
  month?: number;
  quarter?: number;
  parentCategoryId?: string;
  categoryIds?: string[]; // Added for global category filter
  memberIds?: string[];   // Added for global member filter
  transactionType?: 'expense' | 'all';
  isStrictMode?: boolean; // Optional: For strict member filtering
}

// Matches CategoryBreakdownItemDto from backend
export interface CategoryBreakdownItemDto {
  categoryId: string;
  categoryName: string;
  totalIncome: number;
  totalExpense: number;
  netChange: number;
  budgetLimit?: number | null; // Added to match backend
  icon?: string | null;
  color?: string | null;
  subCategories?: CategoryBreakdownItemDto[] | null;
}

export type CategoryBreakdownResponseDto = CategoryBreakdownItemDto[];

// Matches GetMemberBreakdownQueryDto from backend
export interface GetMemberBreakdownQueryDto {
  periodType: PeriodType;
  year?: number;
  month?: number;
  quarter?: number;
  memberIds?: string[];   // Added for global member filter
  transactionType?: 'expense' | 'all';
  isStrictMode?: boolean; // Optional: For strict member filtering
}

// Matches MemberBreakdownItemDto from backend
export interface MemberBreakdownItemDto {
  memberId: string;
  memberName: string;
  totalPaidAmount: number;
  totalExpense: number;
}

export type MemberBreakdownResponseDto = MemberBreakdownItemDto[];


// Matches GetPersonBreakdownQueryDto from backend
export interface GetPersonBreakdownQueryDto {
  periodType: PeriodType;
  year?: number;
  month?: number;
  quarter?: number;
  transactionType?: 'expense' | 'all';
}

// Matches PersonBreakdownItemDto from backend
export interface PersonBreakdownItemDto {
  personId: string;
  personName: string;
  totalIncome: number;
  totalExpense: number;
}

export type PersonBreakdownResponseDto = PersonBreakdownItemDto[];

// Matches GetAverageExpensesQueryDto from backend
export interface GetAverageExpensesQueryDto {
  periodType: PeriodType;
  year?: number;
  month?: number;
  quarter?: number;
  categoryIds?: string[];
}

// Matches AverageExpensesResponseDto from backend
export interface AverageExpensesResponseDto {
  period: string;
  totalExpense: number;
  numberOfDays: number;
  averageMonthlyExpense: number;
  categoryIdsUsed?: string[];
}

// Matches GetBudgetComparisonQueryDto, BudgetComparisonItemDto, BudgetStatus, BudgetComparisonResponseDto from backend
// (These can be added here similarly if you plan to use them soon)
export interface GetBudgetComparisonQueryDto {
  periodType: PeriodType;
  year?: number;
  month?: number;
  quarter?: number;
}

export enum BudgetStatus {
  UnderBudget = 'under_budget',
  NearBudget = 'near_budget',
  OverBudget = 'over_budget',
  NotApplicable = 'not_applicable',
}

export interface BudgetComparisonItemDto {
  categoryId: string;
  categoryName: string;
  budgetLimit?: number | null;
  actualExpenses: number;
  remainingBudget?: number | null;
  percentageSpent?: number | null;
  status: BudgetStatus;
  icon?: string | null;
  color?: string | null;
}

export type BudgetComparisonResponseDto = BudgetComparisonItemDto[];

// Matches GetBudgetTrendQueryDto from backend
export interface GetBudgetTrendQueryDto {
  periodType: PeriodType; // e.g., 'monthly' for trends within a year
  year: number;
  categoryIds?: string[];
  memberIds?: string[];   // Added for global member filter
  transactionType?: 'expense' | 'all';
  isStrictMode?: boolean; // Optional: For strict member filtering
}

// Matches BudgetTrendItemDto from backend
export interface BudgetTrendItemDto {
  period: string; // e.g., '2023-01' or '2023'
  totalBudgetLimit: number;
  totalActualExpenses: number;
}

export type BudgetTrendResponseDto = BudgetTrendItemDto[];

// Matches PersonCategoryBudgetCompareItemDto from backend
export interface PersonCategoryBudgetCompareItemDto {
  categoryName: string;
  totalExpense: number;
  budgetLimit: number;
}

export type PersonCategoryBudgetCompareResponseDto = PersonCategoryBudgetCompareItemDto[];
