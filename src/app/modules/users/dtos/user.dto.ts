// src/users/dto/user.dto.ts

import { Expose, Exclude, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'Identificador único del usuario',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Nombre de pila del usuario',
    example: 'Santiago',
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Díaz',
  })
  @Expose()
  lastName: string;

  @ApiProperty({
    description: 'Correo electrónico único del usuario',
    example: 'santiago.diaz@synapse.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'URL de la imagen de perfil (opcional)',
    example: 'https://cdn.example.com/pic.jpg',
    nullable: true,
  })
  @Expose()
  picture?: string;

  @ApiProperty({
    description: 'Rol asignado al usuario dentro del workspace',
    example: 'ADMIN',
  })
  @Expose()
  role: string;

  @ApiProperty({
    description: 'Fecha de creación del usuario',
    type: String,
    format: 'date-time',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Última fecha de actualización del usuario',
    type: String,
    format: 'date-time',
  })
  @Expose()
  updatedAt: Date;

  @Exclude()
  googleRefreshToken?: string;

  @Exclude()
  JWTRefreshToken?: string;
}
