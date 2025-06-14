// src/transactions/dto/transaction-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SplitRatioItemDto } from '../../categories/dto/split-ratio-item.dto'; // Assuming you have a shared model definition

export class TransactionResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'Transaction ID (UUID)' })
  id!: string;

  @ApiProperty({ example: 'c1d2e3f4-g5h6-7890-1234-567890abcdef', description: 'Category ID (UUID)' })
  categoryId!: string;

  @ApiProperty({ example: 150000, description: 'Transaction amount' })
  amount!: number;

  @ApiProperty({ example: '2023-10-26T10:00:00.000Z', description: 'Date of the transaction (ISO 8601)' })
  date!: Date; // Or string, depending on how you want to represent it in the API response

  @ApiPropertyOptional({ example: 'Monthly groceries', description: 'Optional note for the transaction' })
  note?: string | null;

  @ApiProperty({ example: 'expense', enum: ['income', 'expense'], description: 'Type of transaction' })
  type!: 'income' | 'expense';

  @ApiPropertyOptional({ example: 'm1e2m3b4-e5r6-7890-1234-567890abcdef', description: 'Household Member ID of the payer/receiver', nullable: true })
  payer?: string | null;

  @ApiProperty({ example: false, description: 'Indicates if the transaction is shared among members' })
  isShared!: boolean;

  @ApiPropertyOptional({
    description: 'Structured split ratio for shared transactions',
    type: () => [SplitRatioItemDto], // Important for Swagger to recognize array of objects
    nullable: true,
    example: [{ memberId: 'm1e2m3b4-e5r6-7890-1234-567890abcdef', percentage: 100 }]
  })
  splitRatio?: SplitRatioItemDto[] | null;

  @ApiProperty({ example: 'u1s2e3r4-i5d6-7890-1234-567890abcdef', description: 'User ID associated with the transaction' })
  userId!: string;

  @ApiProperty({ example: '2023-10-26T10:00:00.000Z', description: 'Creation timestamp' })
  createdAt!: Date; // Or string

  @ApiProperty({ example: '2023-10-26T10:05:00.000Z', description: 'Last update timestamp' })
  updatedAt!: Date; // Or string
}

// You might need a shared model for SplitRatioItemDto if it's used in multiple DTOs
// For example, in d:\sources\qlct\qltc-backend\src\models\split-ratio-item.model.ts
// export class SplitRatioItemDto {
//   @ApiProperty() memberId!: string;
//   @ApiProperty() percentage!: number;
// }