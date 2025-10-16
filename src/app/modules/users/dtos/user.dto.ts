// src/users/dto/create-user.dto.ts
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: "User's first name",
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: "User's last name",
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: "User's email address",
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: "URL of the user's profile picture",
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  picture?: string;

  @ApiPropertyOptional({
    description: 'JWT refresh token for session renewal',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsOptional()
  @IsString()
  JWTRefreshToken?: string;
}
