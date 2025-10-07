// src/auth/dto/login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail({}, { message: 'Debe ser un correo válido' })
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @IsString()
  @MinLength(4, { message: 'La contraseña debe tener al menos 4 caracteres' })
  @ApiProperty({ example: 'pass1234', minLength: 4 })
  password: string;
}
