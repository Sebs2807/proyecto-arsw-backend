// src/auth/dtos/register.dto.ts
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsEmail()
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'Juan Perez' })
  name: string;

  @MinLength(6)
  @ApiProperty({ example: 'strongPassword123', minLength: 6 })
  password: string;
}
