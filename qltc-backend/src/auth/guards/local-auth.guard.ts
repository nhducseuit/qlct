// src/auth/guards/local-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  // This guard will automatically invoke the LocalStrategy
  // and add the validated user to req.user if successful.
  // No custom logic needed here unless you want to override handleRequest.
}
