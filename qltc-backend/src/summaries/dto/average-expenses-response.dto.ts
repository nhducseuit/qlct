// src/summaries/dto/average-expenses-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AverageExpensesResponseDto {
  @ApiProperty({ example: '2023-01', description: 'The period for which averages are calculated (e.g., YYYY-MM, YYYY-QQ, YYYY).' })
  period!: string;

  @ApiProperty({ example: 1500.75, description: 'Total expenses in the period for selected categories (or all if none selected).' })
  totalExpense!: number;

  @ApiProperty({ example: 31, description: 'Number of days in the specified period.' })
  numberOfDays!: number;

  @ApiProperty({ example: 1500.75, description: 'Average monthly expense. For monthly period, this is totalExpense. For quarterly, totalExpense/3. For yearly, totalExpense/12.' })
  averageMonthlyExpense!: number;

  @ApiPropertyOptional({
    type: [String],
    description: 'Category IDs used for filtering, if any were provided in the request.',
    example: ['a1b2c3d4-e5f6-7890-1234-567890abcdef'],
  })
  categoryIdsUsed?: string[];
}