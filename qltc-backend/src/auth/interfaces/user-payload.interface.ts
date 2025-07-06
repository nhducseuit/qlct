// d:\sources\qlct\qltc-backend\src\auth\interfaces\user-payload.interface.ts
export interface UserPayload {
  id: string;
  email: string;
  familyId: string;
  name?: string | null;
}

// Optional: Create a class for Swagger documentation if UserPayload is an interface
export class UserPayloadEntity implements UserPayload {
  id!: string;
  email!: string;
  familyId!: string;
  name?: string | null;
}
