// src/auth/guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config'; // Import ConfigService

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private configService: ConfigService) { // Inject ConfigService
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const isForcedDevUser = this.configService.get<string>('FORCE_DEV_USER') === 'true';

    // If FORCE_DEV_USER is true, bypass JWT validation and inject dev user
    if (isForcedDevUser) {
      console.log('[JwtAuthGuard] FORCE_DEV_USER is true. Bypassing JWT validation and injecting dev-user.');
      request.user = { id: 'dev-user', email: 'dev@example.com' }; // Mock user for dev
      return true;
    }

    // Proceed with standard JWT validation
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // If FORCE_DEV_USER was true and handled in canActivate, user will be the dev user.
    // Otherwise, this is the result of standard JWT validation.
    if (err || !user) {
      console.error('[JwtAuthGuard] Authentication error during handleRequest:', info?.message || err?.message);
      throw err || new UnauthorizedException(info?.message || 'User is not authenticated');
    }
    return user;
  }
}