import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
  IsEnum,
  IsBoolean,
  IsUUID,
  ValidateNested,
  IsArray,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SplitRatioItemDto } from '../../categories/dto/split-ratio-item.dto'; // Reusing from categories
import { IsSplitRatioSum100Constraint } from '../../categories/dto/validators/is-split-ratio-sum-100.validator'; // Reusing

enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export class CreateTransactionDto {
  @ApiProperty({ description: 'Amount of the transaction', example: 150000 })
  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount!: number;

  @ApiProperty({
    description: 'Date of the transaction (ISO 8601 format)',
    example: '2025-07-06T10:00:00.000Z',
  })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({
    description: 'Optional note for the transaction',
    example: 'Lunch with colleagues',
  })
  @IsString()
  @IsOptional()
  note?: string | null;

  @ApiProperty({
    description: 'Type of transaction',
    enum: TransactionType,
    example: TransactionType.EXPENSE,
  })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiProperty({
    description: 'The ID of the category for this transaction.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsNotEmpty()
  @IsUUID()
  categoryId!: string;

  @ApiPropertyOptional({
    description:
      'The ID of the household member who paid for this transaction. Required for non-shared expenses.',
    example: 'b1c2d3e4-f5g6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsOptional()
  payer?: string | null;

  @ApiPropertyOptional({
    description: 'Whether the transaction is shared among household members',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isShared?: boolean;

  @ApiPropertyOptional({
    description:
      'The split ratio for the transaction. Required for shared expenses if no default is set on the category.',
    type: [SplitRatioItemDto],
    example: [
      { memberId: 'm1', percentage: 50 },
      { memberId: 'm2', percentage: 50 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SplitRatioItemDto)
  @Validate(IsSplitRatioSum100Constraint)
  @IsOptional()
  splitRatio?: SplitRatioItemDto[] | null;
}