// src/agents/dtos/agent.dto.ts

import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BoardDto } from '../../boards/dtos/board.dto';
import { ListDto } from '../../lists/dtos/list.dto';

export class AgentDto {
  @ApiProperty({
    description: 'Identificador único del Agente (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Nombre descriptivo del Agente',
    example: 'Asistente de Clasificación de Leads',
    maxLength: 100,
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Configuración detallada del flujo o comportamiento del Agente (JSON)',
    example: { step: 1, action: 'classify' },
    required: false,
    nullable: true,
  })
  @Expose()
  flowConfig: any;

  @ApiProperty({
    description:
      'Temperatura de la IA para controlar la aleatoriedad (creatividad). Entre 0.0 y 2.0.',
    example: 0.7,
    default: 0.6,
  })
  @Expose()
  temperature: number;

  @ApiProperty({
    description: 'Límite máximo de tokens que puede generar la respuesta del Agente.',
    example: 800,
    default: 500,
  })
  @Expose()
  maxTokens: number;

  @ApiProperty({
    description: 'Tableros a los que está asignado el Agente',
    type: () => [BoardDto],
    required: false,
  })
  @Type(() => BoardDto)
  @Expose()
  boards: BoardDto[];

  @ApiProperty({
    description: 'Listas que son gestionadas por este Agente',
    type: () => [ListDto],
    required: false,
  })
  @Type(() => ListDto)
  @Expose()
  lists: ListDto[];

  @ApiProperty({
    description: 'Fecha y hora de la última ejecución del Agente',
    example: new Date().toISOString(),
    required: false,
    nullable: true,
    type: String,
    format: 'date-time',
  })
  @Expose()
  lastRunAt: Date;

  @ApiProperty({
    description: 'Fecha y hora de creación del registro',
    example: new Date().toISOString(),
    type: String,
    format: 'date-time',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última actualización del registro',
    example: new Date().toISOString(),
    type: String,
    format: 'date-time',
  })
  @Expose()
  updatedAt: Date;
}
