// src/workspaces/dto/workspace.dto.ts

import { Expose, Exclude, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dtos/user.dto';

@Exclude()
export class WorkspaceDto {
  @ApiProperty({
    description: 'Identificador único del espacio de trabajo',
    example: 'd5f6e7c8-9a0b-1234-5678-90abcdef0123',
    format: 'uuid',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Nombre del espacio de trabajo',
    example: 'Equipo de Desarrollo Synapse',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Lista de usuarios pertenecientes al espacio de trabajo',
    type: () => [UserDto],
  })
  @Type(() => UserDto)
  @Expose()
  users: UserDto[];

  @ApiProperty({
    description: 'Fecha y hora de creación del espacio de trabajo',
    type: String,
    format: 'date-time',
  })
  @Expose()
  createdAt: Date;
}
