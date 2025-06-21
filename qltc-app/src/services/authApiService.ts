// d:\sources\qlct\qltc-app\src\services\authApiService.ts
import apiClient from './api';
import type {
  RegisterDto as BackendRegisterDto, // Alias to avoid name clash if frontend has its own
  LoginDto as BackendLoginDto,     // Alias
  AuthResponseDto,
} from 'src/models/auth'; // We'll define these frontend DTOs next

const API_URL = '/auth';

export const registerAPI = async (
  registerData: BackendRegisterDto,
): Promise<AuthResponseDto> => {
  const response = await apiClient.post<AuthResponseDto>(
    `${API_URL}/register`,
    registerData,
  );
  return response.data;
};

export const loginAPI = async (
  loginData: BackendLoginDto,
): Promise<AuthResponseDto> => {
  const response = await apiClient.post<AuthResponseDto>(`${API_URL}/login`, loginData);
  return response.data;
};
