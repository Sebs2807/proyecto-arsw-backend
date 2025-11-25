// src/agents/dtos/create-agent.dto.ts

import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsUUID,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAgentDto {
  @ApiProperty({
    description:
      'Nombre del Agente. Es un campo obligatorio y debe tener entre 1 y 100 caracteres.',
    example: 'Clasificador Automático de Operaciones',
    maxLength: 100,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres.' })
  readonly name: string;

  @ApiProperty({
    description: 'ID del Workspace al que pertenece este agente. Es obligatorio.',
    example: '8e7b6fbd-2c41-4cc1-9dfe-3cc52e44f18e',
  })
  @IsUUID('4', { message: 'workspaceId debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'workspaceId es obligatorio.' })
  readonly workspaceId: string;

  @ApiProperty({
    description: 'Configuración JSON del flujo del Agente (opcional).',
    example: { logic: 'priority_sort', retry_count: 3 },
    required: false,
    nullable: true,
  })
  @IsOptional()
  readonly flowConfig?: any;

  @ApiProperty({
    description: 'Temperatura de la IA (0.0 a 2.0).',
    example: 0.7,
    default: 0.6,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La temperatura debe ser un número.' })
  @Min(0.0)
  @Max(2.0)
  readonly temperature?: number = 0.6;

  @ApiProperty({
    description: 'Límite de tokens. Por defecto 500.',
    example: 800,
    default: 500,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El máximo de tokens debe ser un número.' })
  @Min(1)
  readonly maxTokens?: number = 500;

  @ApiProperty({
    description: 'IDs de tableros asignados (opcional).',
    example: ['a1b2c3d4-e5f6-7890-1234-567890abcdef'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  readonly boardIds?: string[];

  @ApiProperty({
    description: 'IDs de listas asignadas (opcional).',
    example: ['b1c2d3e4-f5g6-7890-1234-567890abcdef'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  readonly listIds?: string[];
}
