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
    description: 'Identificador del Workspace al que pertenece el Agente',
    example: 'w9f2d3e4-f5a6-7890-1234-567890abc999',
    format: 'uuid',
  })
  @Expose()
  workspaceId: string;

  @ApiProperty({
    description: 'Nombre descriptivo del Agente',
    example: 'Asistente de Clasificación de Leads',
    maxLength: 100,
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Configuración JSON del flujo del agente',
    required: false,
    nullable: true,
  })
  @Expose()
  flowConfig: any;

  @ApiProperty({
    description: 'Temperatura de la IA (0.0 - 2.0)',
    example: 0.7,
    default: 0.6,
  })
  @Expose()
  temperature: number;

  @ApiProperty({
    description: 'Número máximo de tokens generados',
    example: 800,
    default: 500,
  })
  @Expose()
  maxTokens: number;

  @ApiProperty({
    description: 'Tableros asignados al agente',
    type: () => [BoardDto],
  })
  @Type(() => BoardDto)
  @Expose()
  boards: BoardDto[];

  @ApiProperty({
    description: 'Listas gestionadas por el agente',
    type: () => [ListDto],
  })
  @Type(() => ListDto)
  @Expose()
  lists: ListDto[];

  @ApiProperty({
    description: 'Última ejecución del agente',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @Expose()
  lastRunAt: Date;

  @ApiProperty({
    description: 'Fecha de creación',
    type: String,
    format: 'date-time',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    type: String,
    format: 'date-time',
  })
  @Expose()
  updatedAt: Date;
}
