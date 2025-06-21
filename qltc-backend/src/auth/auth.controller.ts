import { Controller, Post, Body, UseGuards, Req, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto'; // Changed from LoginUserDto
import { RegisterDto } from './dto/register.dto'; // Changed from CreateUserDto
import { ApiTags, ApiOperation, ApiResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local-auth.guard'; // If using LocalStrategy
import { AuthenticatedRequest } from './interfaces/authenticated-request.interface';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({
    description: 'User registered successfully and JWT token provided.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Email already in use or invalid data' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> { // Changed DTO
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK) // Set explicit 200 OK for login
  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and get JWT token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful login', type: AuthResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  // @UseGuards(LocalAuthGuard) // Uncomment if LocalStrategy is fully implemented and used
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> { // Changed DTO
    // If not using LocalAuthGuard, AuthService.login handles validation
    return this.authService.login(loginDto);
  }
}
// The @Get('profile') endpoint can be removed if user details are part of AuthResponseDto
// or if you prefer a dedicated /users/me endpoint.