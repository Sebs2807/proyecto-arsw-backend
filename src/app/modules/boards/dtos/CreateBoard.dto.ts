<<<<<<< HEAD
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBoardDto {
  @ApiProperty({ description: 'Título obligatorio del nuevo tablero.', example: 'Proyecto Alpha' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Descripción opcional del tablero.', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'ID del Workspace al que pertenece el tablero.' })
  @IsUUID()
  @IsNotEmpty()
  workspaceId: string;

  @ApiProperty({description: 'Color en formato HEX para personalizar el tablero.', example: '#3498db', required: false,})
  @IsString()
  color: string;

  @ApiProperty({
    description: 'Array de IDs de usuario que serán miembros.',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  memberIds?: string[];
=======
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBoardDto {
  @ApiProperty({
    description: 'Nombre del tablero',
    example: 'Proyecto CRM',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del tablero',
    example: 'Tablero principal del equipo de ventas',
  })
  description?: string;

  @ApiProperty({
    description: 'Lista de IDs de los miembros asignados al tablero',
    example: ['64a1b2c3d4e5f6a7b8c9d0e1', '75f2e3d4a1b2c3e4f5g6h7i8'],
    type: [String],
  })
  memberIds: string[];
>>>>>>> b8eb1a7a911e407d145a1f91a43c478d4f469ea7
}
