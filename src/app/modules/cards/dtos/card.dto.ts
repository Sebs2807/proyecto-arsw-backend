import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ListEntity } from 'src/database/entities/list.entity';

export class CardDto {
  @ApiProperty({
    description: 'Identificador único de la tarjeta',
    example: 'b47a9a0f-4e6e-4bcb-8f13-ef8a0a3a2a12',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Título de la tarjeta',
    example: 'Llamar al cliente para seguimiento',
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Descripción detallada de la tarjeta (opcional)',
    example: 'Confirmar los detalles del contrato con el cliente',
    required: false,
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'Estado actual de la tarjeta',
    example: 'new',
    enum: ['new', 'in_progress', 'completed'],
    default: 'new',
  })
  @Expose()
  status: string;

  @ApiProperty({
    description: 'Prioridad de la tarea',
    example: 'medium',
    enum: ['low', 'medium', 'high'],
    required: false,
  })
  @Expose()
  priority?: 'low' | 'medium' | 'high';

  @ApiProperty({
    description: 'Lista a la que pertenece esta tarjeta',
    type: () => ListEntity,
  })
  @Expose()
  @Type(() => ListEntity)
  list: ListEntity;

  @ApiProperty({
    description: 'Fecha límite o de vencimiento de la tarea',
    example: '2025-11-15T23:59:00.000Z',
    required: false,
  })
  @Expose()
  dueDate?: Date;

  @ApiProperty({
    description: 'Fecha de creación de la tarjeta',
    example: '2025-10-31T15:20:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización de la tarjeta',
    example: '2025-10-31T18:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;
}
