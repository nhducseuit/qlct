import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule and ConfigService
import { LocalStrategy } from './strategies/local.strategy'; // Optional: If you use username/password login
// import { UserModule } from '../users/user.module'; // No longer directly needed if AuthService uses PrismaService

@Module({
  imports: [
    // UserModule, // AuthService will use PrismaService directly
    PrismaModule, // Add PrismaModule
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule to use ConfigService
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Get secret from environment variables
        signOptions: { expiresIn: '7d' }, // Token expiration time, e.g., 7 days
      }),
      inject: [ConfigService], // Inject ConfigService
    }),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy], // Add LocalStrategy
  controllers: [AuthController],
  exports: [AuthService, JwtModule, PassportModule], // Export JwtModule and PassportModule
})
export class AuthModule {}