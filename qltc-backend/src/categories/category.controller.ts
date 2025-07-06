import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { FamilyGuard } from '../auth/guards/family.guard';

@ApiBearerAuth()
@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, FamilyGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'The category has been successfully created.', type: CreateCategoryDto })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() createCategoryDto: CreateCategoryDto, @Req() req: AuthenticatedRequest) {
    const { id: userId } = req.user;
    // The familyId from the DTO is now the source of truth.
    // The FamilyGuard should ensure that the user has access to this family.
    return this.categoryService.create(createCategoryDto, createCategoryDto.familyId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories for the family' })
  @ApiResponse({ status: 200, description: 'List of categories for the family.', type: [CreateCategoryDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@Req() req: AuthenticatedRequest) {
    // The FamilyGuard ensures that the user has access to the familyId in the query
    // The familyId from the query is the source of truth.
    const { familyId } = req.query;
    if (typeof familyId !== 'string') {
      throw new BadRequestException('familyId query parameter is required and must be a string.');
    }
    return this.categoryService.findAll(familyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'The found category.', type: CreateCategoryDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const { familyId } = req.user;
    return this.categoryService.findOne(id, familyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'The category has been successfully updated.', type: CreateCategoryDto })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const { familyId, id: userId } = req.user;
    return this.categoryService.update(id, updateCategoryDto, familyId, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'The category has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const { familyId, id: userId } = req.user;
    return this.categoryService.remove(id, familyId, userId);
  }

  @Post('reorder')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reorder categories' })
  @ApiResponse({ status: 200, description: 'Categories reordered successfully.' })
  reorder(@Req() req: AuthenticatedRequest, @Body() reorderDto: ReorderCategoriesDto) {
    const { familyId, id: userId } = req.user;
    return this.categoryService.reorder(familyId, userId, reorderDto);
  }
}
