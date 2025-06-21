// d:\sources\qlct\qltc-app\src\models\auth.ts

// Corresponds to Backend: src/auth/dto/register.dto.ts
export interface RegisterDto {
  email: string;
  password?: string; // Make password optional for frontend state before sending
}

// Corresponds to Backend: src/auth/dto/login.dto.ts
export interface LoginDto {
  email: string;
  password?: string; // Make password optional for frontend state before sending
}

// Corresponds to Backend: src/auth/interfaces/user-payload.interface.ts
export interface UserPayload {
  id: string;
  email: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: UserPayload;
}
