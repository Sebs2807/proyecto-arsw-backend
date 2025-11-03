import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsBoolean, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Role } from 'src/database/entities/userworkspace.entity';

export class QueryUserDto {
  @ApiProperty({
    description: 'Término de búsqueda general (ej: nombre o email).',
    required: false,
    example: 'john',
  })
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Filtro para seleccionar miembros por rol.',
    required: false,
    enum: Role,
    example: Role.MEMBER,
  })
  @IsOptional()
  role?: Role;

  @ApiProperty({
    description:
      'Filtro para listar solo los miembros asociados a un tablero específico por su ID.',
    required: false,
    type: 'string',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsOptional()
  boardId?: string;

  @ApiProperty({
    description: 'ID del Workspace al que pertenece el tablero',
    required: false,
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  workspaceId?: string;

  @ApiProperty({
    description: 'Número de la página a solicitar. Debe ser >= 1.',
    required: false,
    type: 'number',
    minimum: 1,
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: 'Límite de ítems a devolver por página.',
    required: false,
    type: 'number',
    minimum: 1,
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 10;

  @ApiProperty({
    description:
      'Si es verdadero (por defecto), excluye los miembros del workspace. Si es falso, trae solo los miembros del workspace.',
    required: false,
    type: 'boolean',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return true; // default
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return Boolean(value);
  })
  excludeWorkspaceMembers?: boolean = true;
}
