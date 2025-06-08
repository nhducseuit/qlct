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
  @Min(0.01, { message: 'Amount must be greater than 0' }) // Assuming amount cannot be zero
  amount!: number;

  @ApiProperty({ description: 'Date of the transaction (ISO 8601 format)', example: '2025-07-06T10:00:00.000Z' })
  @IsDateString()
  date!: string; // Will be converted to Date object by Prisma

  @ApiPropertyOptional({ description: 'Optional note for the transaction', example: 'Lunch with colleagues' })
  @IsString()
  @IsOptional()
  note?: string | null;

  @ApiProperty({ description: 'Type of transaction', enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiPropertyOptional({ description: 'ID of the household member who paid/received', example: 'uuid-for-chong' })
  @IsUUID()
  @IsOptional()
  payer?: string | null; // Will store HouseholdMember ID

  @ApiPropertyOptional({ description: 'Is this a shared transaction?', default: false })
  @IsBoolean()
  @IsOptional()
  isShared?: boolean = false;

  @ApiProperty({ description: 'ID of the category for this transaction', example: 'uuid-for-category' })
  @IsUUID()
  categoryId!: string;

  @ApiPropertyOptional({
    description: 'Custom split ratio for this transaction. If isShared is true and this is not provided, category default will be used. Sum of percentages must be 100 if provided.',
    type: [SplitRatioItemDto],
    example: [{ memberId: 'uuid-chong', percentage: 60 }, { memberId: 'uuid-vo', percentage: 40 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SplitRatioItemDto)
  @Validate(IsSplitRatioSum100Constraint, {
    message: 'The sum of percentages in splitRatio must be 100 if the array is provided and not empty.',
  })
  @IsOptional()
  splitRatio?: SplitRatioItemDto[];

  // userId will be set by the service based on the authenticated user.
  // createdAt and updatedAt will be set by the database/Prisma.
}