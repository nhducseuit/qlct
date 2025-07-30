import { ApiProperty } from '@nestjs/swagger';

export class MemberBreakdownItemDto {
  @ApiProperty({ example: 'm1b2c3d4-e5f6-7890-1234-567890mnopqr', description: 'Household Member ID' })
  memberId!: string;

  @ApiProperty({ example: 'Chồng', description: 'Household Member Name' })
  memberName!: string;

  @ApiProperty({ example: 1500.00, description: 'Tổng số tiền thành viên này đã trực tiếp chi ra trong kỳ' })
  totalPaidAmount!: number;

  @ApiProperty({ example: 850.25, description: 'Tổng chi phí được chia cho thành viên này trong kỳ' })
  totalExpense!: number;
}

export type MemberBreakdownResponseDto = MemberBreakdownItemDto[];