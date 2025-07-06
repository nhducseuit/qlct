import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePersonDto {
  @ApiProperty({ description: 'Full name of the person', example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Social ID (unique)', example: '123456789' })
  @IsString()
  @IsOptional()
  socialId?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+84901234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;
}
