import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config'; // Import ConfigService
import { UserPayload } from '../interfaces/user-payload.interface';
import { AuthService } from '../auth.service'; // Import AuthService

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService, // Inject ConfigService
    private authService: AuthService,     // Inject AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'), // Get secret from environment
    });
  }

  async validate(payload: UserPayload): Promise<UserPayload> {
    // Validate that the user still exists in the database based on the payload ID
    // The payload here is what you put into the JWT (e.g., { id: user.id, email: user.email })
    const user = await this.authService.findUserById(payload.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user; // This will be attached to req.user
  }
}