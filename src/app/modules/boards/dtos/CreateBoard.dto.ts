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
}
