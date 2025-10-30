import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { Role } from 'src/database/entities/userworkspace.entity';

export class AddUserToWorkspaceDto {
  @ApiProperty({
    description: 'ID del usuario que será agregado al workspace',
    example: 'user_123',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'ID del workspace al que se agregará el usuario',
    example: 'workspace_456',
  })
  @IsNotEmpty()
  @IsString()
  workspaceId: string;

  @ApiProperty({
    description: 'Rol que tendrá el usuario en el workspace',
    example: Role.ADMIN,
    enum: Role,
  })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
