import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // Optional: for Swagger documentation

export class SplitRatioItemDto {
  @ApiProperty({ description: 'ID of the household member', example: 'uuid-chong' })
  @IsString()
  @IsNotEmpty()
  memberId!: string;

  @ApiProperty({ description: 'Percentage share for this member (0-100)', example: 60 })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage!: number;
}