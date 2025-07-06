import { Module } from '@nestjs/common';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';
// import { PrismaService } from '../prisma/prisma.service';

import { PersonModule } from '../person/person.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PersonModule],
  controllers: [FamilyController],
  providers: [FamilyService, PrismaService],
  exports: [FamilyService], // Export FamilyService
})
export class FamilyModule {}
