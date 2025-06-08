import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
// UserModule might be imported if direct user checks are needed beyond JWT, but not for this basic setup.
// PrismaModule is global, so PrismaService is available without importing PrismaModule here.
// However, if PrismaModule were not global, you would import it:
// import { PrismaModule } from '../prisma/prisma.module';

@Module({
  // imports: [PrismaModule], // Only if PrismaModule is not global
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService] // Export if other modules need it
})
export class CategoryModule {}