import { Controller, Post, Body, Get, Param, Patch, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('persons')
@UseGuards(JwtAuthGuard)
@Controller('persons')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new person' })
  @ApiResponse({ status: 201, description: 'Person created.' })
  @ApiResponse({ status: 409, description: 'Person already exists.' })
  async create(@Body() createPersonDto: CreatePersonDto) {
    return this.personService.create(createPersonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all persons accessible to the user' })
  async findAll(@Req() req: any) {
    if (!req.user || !req.user.id) {
      throw new Error('User or user id not found in request.');
    }
    // Find all family IDs for the user (via their memberships)
    const memberships = await this.personService.getMembershipsByUserId(req.user.id);
    const familyIds = memberships.map((m: { familyId: string }) => m.familyId);
    if (familyIds.length === 0) {
      return [];
    }
    return this.personService.findByFamilyIds(familyIds);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get person by ID' })
  async findOne(@Param('id') id: string) {
    return this.personService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update person by ID' })
  async update(@Param('id') id: string, @Body() createPersonDto: CreatePersonDto) {
    return this.personService.update(id, createPersonDto);
  }
}
