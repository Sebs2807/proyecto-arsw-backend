import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { Role } from 'src/database/entities/userworkspace.entity';

export class UpdateUserWorkspaceDto {
  @ApiProperty({
    description: 'ID of the user to update in the workspace',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
  })
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  userId: string;

  @ApiProperty({
    description: 'ID of the workspace',
    example: 'f1e2d3c4-b5a6-7890-abcd-0987654321fe',
  })
  @IsUUID('4', { message: 'workspaceId must be a valid UUID' })
  workspaceId: string;

  @ApiProperty({
    description: 'New role of the user in the workspace',
    enum: Role,
    example: Role.MEMBER,
  })
  @IsEnum(Role, { message: 'role must be a valid Role' })
  role: Role;
}
