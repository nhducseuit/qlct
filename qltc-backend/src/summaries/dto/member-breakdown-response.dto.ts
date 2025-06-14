// src/summaries/dto/member-breakdown-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class MemberBreakdownItemDto {
  @ApiProperty({ example: 'm1b2c3d4-e5f6-7890-1234-567890mnopqr', description: 'Household Member ID' })
  memberId!: string;

  @ApiProperty({ example: 'Chồng', description: 'Household Member Name' })
  memberName!: string;

  @ApiProperty({ example: 1500.00, description: 'Total income attributed to this member in the period' })
  totalIncome!: number;

  @ApiProperty({ example: 850.25, description: 'Total expense attributed to this member in the period' })
  totalExpense!: number;

  @ApiProperty({ example: 649.75, description: 'Net change (income - expense) for this member' })
  netChange!: number;
}

export type MemberBreakdownResponseDto = MemberBreakdownItemDto[];