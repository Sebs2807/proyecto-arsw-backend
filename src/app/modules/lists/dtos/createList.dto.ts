import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, IsInt, Min } from 'class-validator';

export class CreateListDto {
  @ApiProperty({
    description: 'Título de la lista',
    example: 'Prospectos nuevos',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Descripción opcional de la lista',
    example: 'Contactos que acaban de ingresar al embudo de ventas',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Orden o posición de la lista dentro del tablero',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiProperty({
    description: 'ID del tablero al que pertenece la lista',
    example: 'cba24a11-8f94-42ef-9b61-5cd71d6f3c81',
  })
  @IsUUID()
  @IsNotEmpty()
  boardId: string;
}
