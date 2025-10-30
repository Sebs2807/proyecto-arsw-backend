// src/common/dto/pagination-query.dto.ts (o dentro de tu módulo 'boards')

import { IsOptional, IsString, IsInt, Min, Max, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryBoardDto {
  @ApiProperty({ description: 'Número de página actual', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({ description: 'Elementos por página', required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiProperty({ description: 'ID del Workspace al que pertenece el tablero', format: 'uuid' })
  @IsUUID()
  workspaceId: string;

  @ApiProperty({ description: 'Cadena de búsqueda para filtrar (ej. título)', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: '' })
  @IsOptional()
  @IsString()
  boardId?: string;
}
