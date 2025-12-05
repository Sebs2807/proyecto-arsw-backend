// src/agents/dtos/updateAgent.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsNumber, IsUUID } from 'class-validator';

export class UpdateAgentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  flowConfig?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxTokens?: number;

  @ApiProperty({
    description: 'IDs de tableros',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  boardIds?: string[];

  @ApiProperty({
    description: 'IDs de listas',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  listIds?: string[];

  @ApiProperty({
    description: 'ID del Workspace del agente',
    required: false,
    example: '9f34bdf3-2da0-4c02-bfd4-8ecc5871ab29',
  })
  @IsOptional()
  @IsUUID()
  workspaceId?: string;
}
