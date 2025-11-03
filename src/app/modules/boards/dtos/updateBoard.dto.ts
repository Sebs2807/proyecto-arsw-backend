// src/modules/boards/dtos/updateBoard.dto.ts
import { IsOptional, IsString, IsArray, IsHexColor } from 'class-validator';

export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  memberIds?: string[];
}
