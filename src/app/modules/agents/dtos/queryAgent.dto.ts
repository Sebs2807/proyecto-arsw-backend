// src/agents/dtos/query-agent.dto.ts
import { IsOptional, IsString, IsInt, Min, Max, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryAgentDto {
  @ApiProperty({
    description: 'Número de página actual para la paginación.',
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: 'Cantidad de Agentes a retornar por página (límite).',
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiProperty({
    description: 'Cadena para buscar agentes por coincidencia parcial en su nombre.',
    required: false,
    example: 'Asistente',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'ID del board para filtrar agentes.',
    required: false,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4')
  boardId?: string;

  @ApiProperty({
    description: 'ID del Workspace al que pertenecen los agentes.',
    required: true,
    format: 'uuid',
  })
  @IsUUID('4', { message: 'workspaceId debe ser un UUID válido.' })
  workspaceId: string;
}
