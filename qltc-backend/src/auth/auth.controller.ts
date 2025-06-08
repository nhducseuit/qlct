import { Controller, Post, Body, UseGuards, Get, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// Define an interface for the request object that includes the user property
interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @HttpCode(HttpStatus.OK) // Set explicit 200 OK for login
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @UseGuards(JwtAuthGuard) // Protect this route
  @Get('profile')
  getProfile(@Req() req: AuthenticatedRequest) {
    return req.user; // req.user is populated by JwtStrategy.validate
  }
}