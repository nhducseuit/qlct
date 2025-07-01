import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto'; // Changed from LoginUserDto
import { RegisterDto } from './dto/register.dto'; // Changed from CreateUserDto
import { UserPayload } from './interfaces/user-payload.interface';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      familyId: user.familyId,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        familyId: user.familyId,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Use a transaction to create a family and a user together
    const newUser = await this.prisma.$transaction(async (tx) => {
      // 1. Create a new Family for the user
      const newFamily = await tx.family.create({
        data: {
          name: `${registerDto.email}'s Family`,
        },
      });

      // 2. Create the new user and link them to the new family
      const user = await tx.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          familyId: newFamily.id,
        },
      });
      return user;
    });

    const payload: UserPayload = {
      id: newUser.id,
      email: newUser.email,
      familyId: newUser.familyId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: newUser.id,
        email: newUser.email,
        familyId: newUser.familyId,
      },
    };
  }

  async findUserById(id: string): Promise<UserPayload | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, familyId: true },
    });
    if (user) {
      return user;
    }
    return null;
  }
}