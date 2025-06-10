import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class SplitRatioItemDto {
  @IsString()
  @IsNotEmpty()
  memberId!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  percentage!: number;
}

export class CreatePredefinedSplitRatioDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SplitRatioItemDto)
  splitRatio!: SplitRatioItemDto[];

  // userId is added by the service based on the authenticated user
}