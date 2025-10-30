import { Injectable, Logger } from '@nestjs/common';
import { UsersWorkspacesDBService } from 'src/database/dbservices/usersworkspaces.dbservice';
import { Role } from 'src/database/entities/userworkspace.entity';

@Injectable()
export class UsersWorkspacesService {
  private readonly logger = new Logger(UsersWorkspacesService.name);
  constructor(private readonly usersWokspacesDBService: UsersWorkspacesDBService) {}

  addUserToWorkspace(userId: string, workspaceId: string, role: Role) {
    this.logger.log(`Adding user ${userId} to workspace ${workspaceId} with role ${role}`);
    try {
      const newUserWorkspace = this.usersWokspacesDBService.repository.create({
        user: { id: userId },
        workspace: { id: workspaceId },
        role,
      });
      this.logger.log(`New user-workspace entity created: ${JSON.stringify(newUserWorkspace)}`);
      return this.usersWokspacesDBService.repository.save(newUserWorkspace);
    } catch (err) {
      this.logger.error('Error adding user to workspace', err);
      throw err;
    }
  }
}
