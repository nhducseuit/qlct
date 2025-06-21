import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto'; // Changed from LoginUserDto
import { RegisterDto } from './dto/register.dto'; // Changed from CreateUserDto
import { UserPayload } from './interfaces/user-payload.interface';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService, // Use PrismaService directly
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<UserPayload | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(pass, user.password))) {
      // Return a subset of user data to be included in the JWT payload
      const { password, ...result } = user; // Destructure to exclude password hash
      return { id: result.id, email: result.email }; // UserPayload structure
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> { // Changed DTO and return type
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Generate JWT token
    const payload: UserPayload = { id: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email }, // Return user details along with token
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> { // Changed DTO and return type
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({ where: { email: registerDto.email } });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
      },
      select: { id: true, email: true }, // Select only necessary fields for the payload
    });

    // Generate JWT token for the new user
    const payload: UserPayload = { id: newUser.id, email: newUser.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: newUser.id, email: newUser.email }, // Return user details
    };
  }

  // Method to get user details by ID, used by JwtStrategy
  async findUserById(id: string): Promise<UserPayload | null> {
      return this.prisma.user.findUnique({ where: { id }, select: { id: true, email: true } });
  }
}