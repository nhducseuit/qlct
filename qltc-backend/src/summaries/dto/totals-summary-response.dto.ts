export class PeriodSummaryDto {
  period!: string; // e.g., '2023-01', '2023-Q1', '2023'
  totalIncome!: number;
  totalExpense!: number;
  netChange!: number;
}

export type TotalsSummaryResponseDto = PeriodSummaryDto[];