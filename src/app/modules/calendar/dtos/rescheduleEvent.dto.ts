import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class RescheduleEventDto {
  @ApiPropertyOptional({ description: 'Nueva fecha/hora de inicio en ISO (dateTime)', example: '2025-11-30T10:00:00Z' })
  @IsOptional()
  @IsString()
  @Expose()
  startDateTime?: string;

  @ApiPropertyOptional({ description: 'Nueva fecha de inicio para evento de todo el día (YYYY-MM-DD)', example: '2025-11-30' })
  @IsOptional()
  @IsString()
  @Expose()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Nueva fecha/hora de fin en ISO (dateTime)', example: '2025-11-30T11:00:00Z' })
  @IsOptional()
  @IsString()
  @Expose()
  endDateTime?: string;

  @ApiPropertyOptional({ description: 'Nueva fecha de fin para evento de todo el día (YYYY-MM-DD)', example: '2025-11-30' })
  @IsOptional()
  @IsString()
  @Expose()
  endDate?: string;
}
