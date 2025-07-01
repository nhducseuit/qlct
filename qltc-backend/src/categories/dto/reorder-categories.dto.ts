import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ReorderOperation {
  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiProperty()
  @IsNumber()
  order!: number;
}

export class ReorderCategoriesDto {
  @ApiProperty({ type: [ReorderOperation] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderOperation)
  operations!: ReorderOperation[];
}

