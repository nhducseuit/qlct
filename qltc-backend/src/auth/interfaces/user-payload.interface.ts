// d:\sources\qlct\qltc-backend\src\auth\interfaces\user-payload.interface.ts
export interface UserPayload {
  id: string;
  email: string;
  // any other fields you put in the JWT payload
}

// Optional: Create a class for Swagger documentation if UserPayload is an interface
export class UserPayloadEntity implements UserPayload {
  id!: string;
  email!: string;
}
