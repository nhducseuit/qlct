// src/auth/dto/auth-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { UserPayload, UserPayloadEntity } from '../interfaces/user-payload.interface'; // Import UserPayloadEntity

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken!: string;

  @ApiProperty({
    description: 'Details of the authenticated user',
    type: UserPayloadEntity, // Use the UserPayloadEntity class for Swagger
  })
  user!: UserPayload; // Include user details in the response
}