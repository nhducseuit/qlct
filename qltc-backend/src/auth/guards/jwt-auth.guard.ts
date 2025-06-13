// src/auth/guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    const isDevEnvironment = process.env.NODE_ENV !== 'production';

    if (isDevEnvironment && authHeader === 'Bearer dev-token-dev-user') {
      console.log('[JwtAuthGuard] DEV mode: dev-token-dev-user detected. Bypassing JWT validation.');
      request.user = { id: 'dev-user', email: 'dev@example.com' }; // Mock user for dev
      return true; // Bypass actual JWT validation for this specific token in dev
    } else if (isDevEnvironment && !authHeader) {
      // If no token is provided in a dev environment, default to dev-user
      // This makes guarded HTTP routes behave like NotificationsGateway in dev
      console.warn('[JwtAuthGuard] DEV mode: No token provided. Injecting dev-user.');
      request.user = { id: 'dev-user', email: 'dev@example.com' };
      return true;
    }
    // Proceed with standard JWT validation
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // You can throw an exception based on either err or info
    if (err || !user) {
      console.error('[JwtAuthGuard] Authentication error during handleRequest:', info?.message || err?.message);
      throw err || new UnauthorizedException(info?.message || 'User is not authenticated');
    }
    return user;
  }
}