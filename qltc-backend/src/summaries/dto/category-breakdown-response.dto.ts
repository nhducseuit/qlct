// src/summaries/dto/category-breakdown-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryBreakdownItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'Category ID' })
  categoryId!: string;

  @ApiProperty({ example: 'Food & Dining', description: 'Category Name' })
  categoryName!: string;

  @ApiProperty({ example: 500.75, description: 'Total income for this category in the period' })
  totalIncome!: number;

  @ApiProperty({ example: 1250.50, description: 'Total expense for this category in the period' })
  totalExpense!: number;

  @ApiProperty({ example: -749.75, description: 'Net change (income - expense) for this category' })
  netChange!: number;

  @ApiPropertyOptional({ example: 5000000, description: 'Budget limit for this category for the period.', nullable: true })
  budgetLimit?: number | null;

  @ApiProperty({ example: 'icon-name', description: 'Category icon', nullable: true })
  icon?: string | null;

  @ApiProperty({ example: '#FF0000', description: 'Category color', nullable: true })
  color?: string | null;

  @ApiProperty({ type: () => [CategoryBreakdownItemDto], description: 'Sub-category breakdowns, if applicable', nullable: true })
  subCategories?: CategoryBreakdownItemDto[] | null; // For hierarchical display
}

export type CategoryBreakdownResponseDto = CategoryBreakdownItemDto[];