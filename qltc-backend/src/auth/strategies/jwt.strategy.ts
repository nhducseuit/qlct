import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../../config/constants'; // Adjusted path
import { UserService } from '../../users/user.service'; // Adjusted path

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) { // Inject UserService if you need to fetch full user object
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    // Payload here is the decoded JWT. You can add more user info to JWT if needed.
    return { userId: payload.sub, email: payload.email }; // This will be attached to req.user
  }
}