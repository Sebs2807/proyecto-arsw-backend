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
}
