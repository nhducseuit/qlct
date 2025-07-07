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

    const person = await this.prisma.person.findUnique({
      where: { email: user.email },
      include: { memberships: true },
    });

    if (!person || person.memberships.length === 0) {
      throw new UnauthorizedException('User is not associated with any family.');
    }

    // Only use a valid familyId from memberships, never the user/person id
    const validMembership = person.memberships.find(m => m.familyId && m.familyId !== person.id);
    const familyId = validMembership ? validMembership.familyId : person.memberships[0].familyId;

    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      familyId: familyId,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        familyId: familyId,
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

    // Use a transaction to create all necessary records atomically
    const { user: newUser, familyId } = await this.prisma.$transaction(async (tx) => {
      // 1. Create a new Family for the user
      const newFamily = await tx.family.create({
        data: {
          name: `${registerDto.name}'s Family`,
        },
      });

      // 2. Create the new user and link them to the new family
      const user = await tx.user.create({
        data: {
          name: registerDto.name,
          email: registerDto.email,
          password: hashedPassword,
          family: {
            connect: { id: newFamily.id },
          },
        },
      });

      // 3. Create a corresponding Person record for the user
      const person = await tx.person.create({
        data: {
          name: registerDto.name,
          email: registerDto.email,
        },
      });

      // 4. Create the HouseholdMembership to link the Person to the Family
      await tx.householdMembership.create({
        data: {
          familyId: newFamily.id,
          personId: person.id,
        },
      });

      return { user, familyId: newFamily.id };
    });

    const payload: UserPayload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      familyId: familyId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        familyId: familyId,
      },
    };
  }

  async findUserById(id: string): Promise<UserPayload | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, familyId: true },
    });
    if (user) {
      return user;
    }
    return null;
  }
}