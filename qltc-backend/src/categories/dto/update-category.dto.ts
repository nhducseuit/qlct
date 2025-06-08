import { PartialType } from '@nestjs/swagger'; // Or @nestjs/mapped-types
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}