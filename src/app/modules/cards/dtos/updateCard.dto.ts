import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsUUID, IsDateString, Length, IsEmail } from 'class-validator';

export class UpdateCardDto {
  @ApiPropertyOptional({
    description: 'Título actualizado de la tarjeta',
    example: 'Actualizar seguimiento con el cliente',
  })
  @IsOptional()
  @IsString()
  @Length(1, 150)
  @Expose()
  title?: string;

  @ApiPropertyOptional({
    description: 'Nueva descripción de la tarjeta',
    example: 'Se deben confirmar los términos del nuevo contrato',
  })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  @Expose()
  description?: string;

  @ApiPropertyOptional({
    description: 'Prioridad de la tarjeta',
    example: 'high',
    enum: ['low', 'medium', 'high'],
  })
  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  @Expose()
  priority?: 'low' | 'medium' | 'high';

  @ApiPropertyOptional({
    description: 'Identificador de la nueva lista a la que se moverá la tarjeta',
    example: '6f5d4c3b-2a1e-4d9b-9c5f-8a1b2c3d4e5f',
  })
  @IsOptional()
  @IsUUID()
  @Expose()
  listId?: string;

  @ApiPropertyOptional({
    description: 'Nueva fecha de vencimiento de la tarjeta',
    example: '2025-12-10T18:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  @Expose()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Nombre del contacto o lead asociado al card',
    example: 'Carlos Rodríguez',
  })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  @Expose()
  contactName?: string;

  @ApiPropertyOptional({
    description: 'Correo del contacto',
    example: 'carlos@empresa.com',
  })
  @IsOptional()
  @IsEmail()
  @Length(0, 150)
  @Expose()
  contactEmail?: string;

  @ApiPropertyOptional({
    description: 'Número telefónico del contacto',
    example: '+573001112233',
  })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  @Expose()
  contactPhone?: string;

  @ApiPropertyOptional({
    description: 'Industria o sector del cliente',
    example: 'Tecnología',
  })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  @Expose()
  industry?: string;
}
