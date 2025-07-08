import { ApiProperty } from '@nestjs/swagger';

export class PersonBreakdownItemDto {
  @ApiProperty({ description: 'Person ID', example: 'person-uuid-1' })
  personId!: string;

  @ApiProperty({ description: 'Person name', example: 'Nguyen Van A' })
  personName!: string;

  @ApiProperty({ description: 'Total income for this person', example: 500000 })
  totalIncome!: number;

  @ApiProperty({ description: 'Total expense for this person', example: 1200000 })
  totalExpense!: number;
}
