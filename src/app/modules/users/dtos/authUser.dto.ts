import { Expose, Type } from 'class-transformer';
import { UserDto } from './user.dto';
import { WorkspaceDto } from '../../workspaces/dtos/workspace.dto';

export class AuthUserDto extends UserDto {
  @Type(() => WorkspaceDto)
  @Expose()
  workspace: WorkspaceDto;

  @Expose()
  updateAt: Date;
}
