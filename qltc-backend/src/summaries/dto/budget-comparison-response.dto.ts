// src/summaries/dto/budget-comparison-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BudgetStatus {
  UnderBudget = 'under_budget',
  NearBudget = 'near_budget', // e.g., 80-100%
  OverBudget = 'over_budget',
  NotApplicable = 'not_applicable', // For categories without a budget
}

export class BudgetComparisonItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'Category ID' })
  categoryId!: string;

  @ApiProperty({ example: 'Groceries', description: 'Category Name' })
  categoryName!: string;

  @ApiPropertyOptional({ example: 5000000, description: 'Budget limit set for this category for the period.', nullable: true })
  budgetLimit?: number | null;

  @ApiProperty({ example: 4500000, description: 'Actual expenses for this category in the period.' })
  actualExpenses!: number;

  @ApiPropertyOptional({ example: 500000, description: 'Remaining budget (budgetLimit - actualExpenses). Can be negative if over budget.', nullable: true })
  remainingBudget?: number | null;

  @ApiPropertyOptional({ example: 90, description: 'Percentage of budget spent (actualExpenses / budgetLimit * 100).', nullable: true })
  percentageSpent?: number | null;

  @ApiProperty({ enum: BudgetStatus, example: BudgetStatus.NearBudget, description: 'Status of spending against the budget.' })
  status!: BudgetStatus;

  @ApiPropertyOptional({ example: 'icon-name', description: 'Category icon', nullable: true })
  icon?: string | null;

  @ApiPropertyOptional({ example: '#FF0000', description: 'Category color', nullable: true })
  color?: string | null;
}

export type BudgetComparisonResponseDto = BudgetComparisonItemDto[];