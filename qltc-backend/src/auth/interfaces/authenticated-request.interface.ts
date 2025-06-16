// d:\sources\qlct\qltc-backend\src\auth\interfaces\authenticated-request.interface.ts
import { Request } from 'express';
import { UserPayload } from './user-payload.interface'; // Assuming UserPayload contains { userId: string, email: string }

export interface AuthenticatedRequest extends Request {
  user: UserPayload;
}
