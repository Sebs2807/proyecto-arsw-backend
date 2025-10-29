// src/boards/dto/board.dto.ts

import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dtos/user.dto';
import { WorkspaceDto } from '../../workspaces/dtos/workspace.dto';

export class BoardDto {
  @ApiProperty({
    description: 'Identificador único del tablero',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Título del tablero',
    example: 'Proyecto de Marketing Q4',
    maxLength: 100,
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Descripción detallada del tablero (opcional)',
    example: 'Tareas, objetivos y seguimiento del equipo de marketing.',
    required: false,
    nullable: true,
  })
  @Expose()
  description: string;

  @ApiProperty({
    description: 'Usuario que creó el tablero',
    type: () => UserDto,
  })
  @Type(() => UserDto)
  @Expose()
  createdBy: UserDto;

  @ApiProperty({
    description: 'Espacio de trabajo al que pertenece el tablero',
    type: () => WorkspaceDto,
  })
  @Type(() => WorkspaceDto)
  @Expose()
  workspace: WorkspaceDto;

  @ApiProperty({
    description: 'Lista de miembros que tienen acceso al tablero',
    type: () => [UserDto],
  })
  @Type(() => UserDto)
  @Expose()
  members: UserDto[];

  @ApiProperty({
    description: 'Fecha y hora de creación del tablero',
    example: new Date().toISOString(),
    type: String,
    format: 'date-time',
  })
  @Expose()
  createdAt: Date;
}
