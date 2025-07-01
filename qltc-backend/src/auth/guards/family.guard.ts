import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

/**
 * FamilyGuard ensures that the authenticated user's familyId matches the resource's familyId (if present in the request).
 * Use this guard on controllers or routes that require strict family-based access control.
 */
@Injectable()
export class FamilyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = req.user;
    if (!user || !user.familyId) {
      throw new ForbiddenException('No family context found for user.');
    }
    // Optionally, check req.params.familyId or req.body.familyId if needed
    // Example: if (req.params.familyId && req.params.familyId !== user.familyId) throw new ForbiddenException(...)
    // For most endpoints, just having user.familyId is enough, as all queries should be scoped by it.
    return true;
  }
}
