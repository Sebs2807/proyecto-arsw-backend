import { ApiProperty } from '@nestjs/swagger';
<<<<<<< HEAD
import { IsOptional, IsUUID } from 'class-validator';
=======
import { IsUUID } from 'class-validator';
>>>>>>> 2e2c31f52a15a7481db89a7e1293cd04adcc92cf
import { Role } from 'src/database/entities/userworkspace.entity';

export class QueryUserDto {
  @ApiProperty({
    description: 'Término de búsqueda general (ej: nombre o email).',
    required: false,
    example: 'john',
  })
  search?: string;

  @ApiProperty({
    description: 'Filtro para seleccionar miembros por rol.',
    required: false,
    enum: Role,
    example: Role.MEMBER,
  })
  role?: Role;

  @ApiProperty({
    description:
      'Filtro para listar solo los miembros asociados a un tablero específico por su ID.',
    required: false,
    type: 'string',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  boardId?: string;

  @ApiProperty({ description: 'ID del Workspace al que pertenece el tablero', format: 'uuid' })
  @IsUUID()
  @IsOptional()
  workspaceId?: string;

  @ApiProperty({
    description: 'Número de la página a solicitar. Debe ser >= 1.',
    required: true,
    type: 'number',
    minimum: 1,
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Límite de ítems a devolver por página.',
    required: true,
    type: 'number',
    minimum: 1,
    example: 10,
  })
  limit: number;
}
