import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { FamilyService } from './family.service';
import { PersonService } from '../person/person.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


@Controller('families')
@UseGuards(JwtAuthGuard)
export class FamilyController {
  constructor(
    private readonly familyService: FamilyService,
    private readonly personService: PersonService,
  ) {}


  @Get()
  async findAll(@Request() req: ExpressRequest) {
    // Defensive: check for user and name
    const user = (req as any).user;
    if (!user || !user.name) {
      throw new Error('User not authenticated or missing name');
    }
    // Try to find person by name first
    let person = await this.personService.findByName(user.name);
    // Fallback to email if not found by name
    if (!person && user.email) {
      person = await this.personService.findByEmail(user.email);
    }
    if (!person) throw new Error('No person found for user');
    return this.familyService.findAllForUser(person.id);
  }

  @Post()
  async create(@Body() createFamilyDto: CreateFamilyDto, @Request() req: ExpressRequest) {
    const user = (req as any).user;
    const person = await this.personService.findByEmail(user.email);
    if (!person) throw new Error('No person found for user');
    return this.familyService.create(createFamilyDto, person.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: ExpressRequest) {
    const user = (req as any).user;
    const person = await this.personService.findByEmail(user.email);
    if (!person) throw new Error('No person found for user');
    return this.familyService.findOne(id, person.id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFamilyDto: UpdateFamilyDto, @Request() req: ExpressRequest) {
    const user = (req as any).user;
    const person = await this.personService.findByEmail(user.email);
    if (!person) throw new Error('No person found for user');
    return this.familyService.update(id, updateFamilyDto, person.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: ExpressRequest) {
    const user = (req as any).user;
    const person = await this.personService.findByEmail(user.email);
    if (!person) throw new Error('No person found for user');
    return this.familyService.remove(id, person.id);
  }
}
