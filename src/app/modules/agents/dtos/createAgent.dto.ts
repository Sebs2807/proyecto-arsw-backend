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
    example: 'Clasificador Automático de Tareas',
    maxLength: 100,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres.' })
  readonly name: string;

  @ApiProperty({
    description:
      'Configuración JSON del flujo del Agente (opcional). Se recomienda enviarlo como un objeto si tu entorno NestJS lo deserializa correctamente, o como string JSON.',
    example: { logic: 'priority_sort', retry_count: 3 },
    required: false,
    nullable: true,
  })
  @IsOptional()
  readonly flowConfig?: any;

  @ApiProperty({
    description:
      'Temperatura de la IA para controlar la aleatoriedad (creatividad). Opcional. Debe estar entre 0.0 y 2.0. Por defecto es 0.6.',
    example: 0.7,
    default: 0.6,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La temperatura debe ser un número.' })
  @Min(0.0, { message: 'La temperatura mínima es 0.0.' })
  @Max(2.0, { message: 'La temperatura máxima es 2.0.' })
  readonly temperature?: number = 0.6;

  @ApiProperty({
    description:
      'Límite máximo de tokens que puede generar la respuesta del Agente. Opcional. Por defecto es 500.',
    example: 800,
    default: 500,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El máximo de tokens debe ser un número.' })
  @Min(1, { message: 'El máximo de tokens debe ser al menos 1.' })
  readonly maxTokens?: number = 500;

  @ApiProperty({
    description:
      'Arreglo de IDs de tableros (UUIDs) a los que se asignará el agente inicialmente. Opcional.',
    example: ['a1b2c3d4-e5f6-7890-1234-567890abcdef'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Cada ID de tablero debe ser un UUID válido.' })
  readonly boardIds?: string[];

  @ApiProperty({
    description:
      'Arreglo de IDs de listas (UUIDs) que serán gestionadas por el agente inicialmente. Opcional.',
    example: ['b1c2d3e4-f5g6-7890-1234-567890abcdef'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Cada ID de lista debe ser un UUID válido.' })
  readonly listIds?: string[];
}
