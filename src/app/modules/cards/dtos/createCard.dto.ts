import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsIn,
  IsUUID,
  IsDateString,
  IsNotEmpty,
  Length,
} from 'class-validator';

export class CreateCardDto {
  @ApiProperty({
    description: 'Título de la nueva tarjeta',
    example: 'Llamar al proveedor para confirmar pedido',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @Expose()
  title: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la tarjeta',
    example: 'Verificar disponibilidad de productos antes del viernes',
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  @Expose()
  description?: string;

  @ApiPropertyOptional({
    description: 'Estado inicial de la tarjeta',
    example: 'new',
    enum: ['new', 'in_progress', 'completed'],
    default: 'new',
  })
  @IsOptional()
  @IsIn(['new', 'in_progress', 'completed'])
  @Expose()
  status?: 'new' | 'in_progress' | 'completed' = 'new';

  @ApiPropertyOptional({
    description: 'Prioridad de la tarjeta',
    example: 'medium',
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  })
  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  @Expose()
  priority?: 'low' | 'medium' | 'high' = 'medium';

  @ApiProperty({
    description: 'Identificador de la lista a la que pertenece la tarjeta',
    example: '8b07e0a2-3c2a-4e7a-b1f2-9d8c2b1e4f0a',
  })
  @IsNotEmpty()
  @IsUUID()
  @Expose()
  listId: string;

  @ApiPropertyOptional({
    description: 'Fecha límite o de vencimiento de la tarjeta',
    example: '2025-12-05T17:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  @Expose()
  dueDate?: string;
}
