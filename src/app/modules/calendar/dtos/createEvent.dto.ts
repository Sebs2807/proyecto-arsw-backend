import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsOptional, IsArray, IsNotEmpty } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ description: 'Título del evento', example: 'Reunión con equipo' })
  @IsNotEmpty()
  @IsString()
  @Expose()
  summary: string;

  @ApiPropertyOptional({ description: 'Descripción del evento', example: 'Revisión semanal' })
  @IsOptional()
  @IsString()
  @Expose()
  description?: string;

  @ApiPropertyOptional({
    description:
      'Fecha/hora de inicio en ISO (dateTime) o fecha YYYY-MM-DD (date). Enviar uno de startDateTime o startDate.',
    example: '2025-11-10T10:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  @Expose()
  startDateTime?: string;

  @ApiPropertyOptional({
    description:
      'Fecha de inicio para eventos de día completo (YYYY-MM-DD). Enviar uno de startDateTime o startDate.',
    example: '2025-11-10',
  })
  @IsOptional()
  @IsString()
  @Expose()
  startDate?: string;

  @ApiPropertyOptional({
    description:
      'Fecha/hora de fin en ISO (dateTime) o fecha YYYY-MM-DD (date). Enviar uno de endDateTime o endDate.',
    example: '2025-11-10T11:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  @Expose()
  endDateTime?: string;

  @ApiPropertyOptional({
    description:
      'Fecha de fin para eventos de día completo (YYYY-MM-DD). Enviar uno de endDateTime o endDate.',
    example: '2025-11-10',
  })
  @IsOptional()
  @IsString()
  @Expose()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Lista de asistentes: pueden ser strings con emails o objetos { email }',
    example: ['a@e.com', { email: 'b@e.com' }],
  })
  @IsOptional()
  @IsArray()
  @Expose()
  attendees?: Array<string | { email: string }>;

  @ApiPropertyOptional({
    description:
      'Formato alternativo: objeto start con dateTime o date, p.e. { start: { dateTime: "..." } }',
    example: {
      start: { dateTime: '2025-11-10T10:00:00.000Z' },
      end: { dateTime: '2025-11-10T11:00:00.000Z' },
    },
  })
  @IsOptional()
  @Expose()
  start?: { dateTime?: string; date?: string };

  @ApiPropertyOptional({
    description: 'Formato alternativo: objeto end con dateTime o date',
    example: { dateTime: '2025-11-10T11:00:00.000Z' },
  })
  @IsOptional()
  @Expose()
  end?: { dateTime?: string; date?: string };
}
