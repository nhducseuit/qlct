import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PersonService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPersonDto: CreatePersonDto) {
    // Deduplicate by name (schema only supports name for now)
    const existing = await this.prisma.person.findFirst({
      where: { name: createPersonDto.name },
    });
    if (existing) {
      throw new ConflictException('Person with this name already exists.');
    }
    return this.prisma.person.create({
      data: {
        name: createPersonDto.name,
        ...(createPersonDto.socialId ? { socialId: createPersonDto.socialId } : {}),
        ...(createPersonDto.phone ? { phone: createPersonDto.phone } : {}),
        ...(createPersonDto.email ? { email: createPersonDto.email } : {}),
      },
    });
  }

  // Find a person by name (for user-person mapping)
  async findByName(name: string) {
    if (!name) return null;
    return this.prisma.person.findFirst({ where: { name } });
  }

  // Find a person by email (for user-person mapping)
  async findByEmail(email: string) {
    if (!email) return null;
    return this.prisma.person.findFirst({ where: { email } });
  }

  async findAll() {
    return this.prisma.person.findMany();
  }

  async findOne(id: string) {
    const person = await this.prisma.person.findUnique({ where: { id } });
    if (!person) throw new NotFoundException('Person not found');
    return person;
  }

  async update(id: string, updatePersonDto: UpdatePersonDto) {
    const person = await this.prisma.person.findUnique({ where: { id } });
    if (!person) throw new NotFoundException('Person not found');
    // If updating name, check for conflicts
    if (updatePersonDto.name && updatePersonDto.name !== person.name) {
      const conflict = await this.prisma.person.findFirst({
        where: { name: updatePersonDto.name },
      });
      if (conflict) throw new ConflictException('Person with this name already exists.');
    }
    return this.prisma.person.update({
      where: { id },
      data: {
        name: updatePersonDto.name,
        ...(updatePersonDto.socialId ? { socialId: updatePersonDto.socialId } : {}),
        ...(updatePersonDto.phone ? { phone: updatePersonDto.phone } : {}),
        ...(updatePersonDto.email ? { email: updatePersonDto.email } : {}),
      },
    });
  }
}
