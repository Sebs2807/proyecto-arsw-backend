import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateListDto {
  @ApiProperty({
    description: 'Nuevo título de la lista',
    example: 'Clientes contactados',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Nueva descripción de la lista',
    example: 'Contactos a los que ya se les ha enviado una propuesta',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Nuevo orden o posición de la lista dentro del tablero',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
