import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { BoardDto } from '../../boards/dtos/board.dto';
import { CardDto } from '../../cards/dtos/card.dto';

export class ListDto {
  @ApiProperty({
    description: 'Identificador único de la lista',
    example: 'd9b8f23e-12f4-45c8-8230-9d4ab87a77f1',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Título de la lista',
    example: 'Pendientes',
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Descripción opcional de la lista',
    example: 'Tareas que aún no han sido iniciadas',
    required: false,
    nullable: true,
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'Orden o posición de la lista dentro del tablero',
    example: 1,
  })
  @Expose()
  order: number;

  @ApiProperty({
    description: 'Tablero al que pertenece esta lista',
    type: () => BoardDto,
  })
  @Expose()
  @Type(() => BoardDto)
  board: BoardDto;

  @ApiProperty({
    description: 'Tarjetas asociadas a la lista',
    type: () => [CardDto],
  })
  @Expose()
  @Type(() => CardDto)
  cards: CardDto[];

  @ApiProperty({
    description: 'Fecha de creación de la lista',
    example: '2025-10-31T15:23:45.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización de la lista',
    example: '2025-10-31T16:10:12.000Z',
  })
  @Expose()
  updatedAt: Date;
}
