// src/summaries/dto/budget-trend-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class BudgetTrendItemDto {
  @ApiProperty({ example: '2023-01', description: 'The specific period (e.g., YYYY-MM or YYYY).' })
  period!: string;

  @ApiProperty({ example: 5000000, description: 'Total budget limit for selected categories in this period.' })
  totalBudgetLimit!: number;

  @ApiProperty({ example: 4500000, description: 'Total actual expenses for selected categories in this period.' })
  totalActualExpenses!: number;
}

export type BudgetTrendResponseDto = BudgetTrendItemDto[];