import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsIn,
  IsUUID,
  IsDateString,
  IsNotEmpty,
  IsEmail,
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
    description: 'Nombre del contacto asociado al lead',
    example: 'Carlos Ramírez',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Expose()
  contactName?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico del contacto',
    example: 'carlos.ramirez@empresa.com',
  })
  @IsOptional()
  @IsEmail()
  @Length(1, 150)
  @Expose()
  contactEmail?: string;

  @ApiPropertyOptional({
    description: 'Número telefónico del contacto',
    example: '+57 3204567890',
  })
  @IsOptional()
  @IsString()
  @Length(4, 20)
  @Expose()
  contactPhone?: string;

  @ApiPropertyOptional({
    description: 'Industria del lead o empresa',
    example: 'Tecnología',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Expose()
  industry?: string;

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
