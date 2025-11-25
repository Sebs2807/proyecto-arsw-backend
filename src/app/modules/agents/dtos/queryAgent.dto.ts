// src/agents/dtos/query-agent.dto.ts

import { IsOptional, IsString, IsInt, Min, Max, IsUUID, IsBoolean } from 'class-validator';
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
  @IsInt({ message: 'La página debe ser un número entero.' })
  @Min(1, { message: 'La página mínima es 1.' })
  page: number = 1;

  @ApiProperty({
    description: 'Cantidad de Agentes a retornar por página (límite).',
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero.' })
  @Min(1, { message: 'El límite mínimo es 1.' })
  @Max(100, { message: 'El límite máximo es 100.' })
  limit: number = 10;

  @ApiProperty({
    description:
      'Cadena de texto para buscar Agentes por coincidencia parcial en su **nombre** (`name`).',
    required: false,
    example: 'Asistente',
  })
  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser una cadena de texto.' })
  search?: string;

  @ApiProperty({
    description: 'Filtra Agentes que estén asociados al ID de Tablero (Board) especificado.',
    required: false,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El Board ID debe ser un UUID válido.' })
  boardId?: string;
}
