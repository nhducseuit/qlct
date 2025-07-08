import { ApiProperty } from '@nestjs/swagger';

export class PersonCategoryBudgetCompareItemDto {
  @ApiProperty({ description: 'Tên danh mục (đã gộp theo tên)', example: 'Ăn uống' })
  categoryName!: string;

  @ApiProperty({ description: 'Tổng chi tiêu của tất cả thành viên cho danh mục này', example: 1500000 })
  totalExpense!: number;

  @ApiProperty({ description: 'Tổng hạn mức ngân sách cho danh mục này (gộp các hạn mức cùng tên)', example: 2000000 })
  budgetLimit!: number;
}
