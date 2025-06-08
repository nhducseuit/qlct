// Using a class-validator in a real app is recommended for robust validation
// For now, simple interface or basic validation.
// import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  // @IsEmail()
  email!: string;

  // @IsNotEmpty()
  // @MinLength(6)
  password!: string;
}