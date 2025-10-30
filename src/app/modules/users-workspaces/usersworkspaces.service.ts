import { Injectable, Logger } from '@nestjs/common';
import { UsersWorkspacesDBService } from 'src/database/dbservices/usersworkspaces.dbservice';
import { Role } from 'src/database/entities/userworkspace.entity';

@Injectable()
export class UsersWorkspacesService {
  private readonly logger = new Logger(UsersWorkspacesService.name);

  constructor(private usersWorkspacesDBService: UsersWorkspacesDBService) {}

  async addUserToWorkspace(userId: string, workspaceId: string, role: Role) {
    this.logger.log(`Adding user ${userId} to workspace ${workspaceId} with role ${role}`);
    try {
      const newUserWorkspace = this.usersWorkspacesDBService.repository.create({
        user: { id: userId },
        workspace: { id: workspaceId },
        role,
      });
      this.logger.log(`New user-workspace entity created: ${JSON.stringify(newUserWorkspace)}`);
      return this.usersWorkspacesDBService.repository.save(newUserWorkspace);
    } catch (err) {
      this.logger.error('Error adding user to workspace', err);
      throw err;
    }
  }

  // Actualiza el rol de un usuario en un workspace específico
  async updateUserWorkspace(userId: string, workspaceId: string, role: Role) {
    this.logger.log(
      `Updating UserWorkspace for user ${userId} in workspace ${workspaceId} to role ${role}`,
    );
    try {
      const entity = await this.usersWorkspacesDBService.repository.findOne({
        where: {
          user: { id: userId },
          workspace: { id: workspaceId },
        },
      });
      if (!entity) {
        this.logger.warn(`UserWorkspace for user ${userId} in workspace ${workspaceId} not found`);
        throw new Error('UserWorkspace not found');
      }

      entity.role = role;
      const updated = await this.usersWorkspacesDBService.repository.save(entity);
      this.logger.log(`UserWorkspace for user ${userId} updated successfully`);
      return updated;
    } catch (err) {
      this.logger.error(`Error updating UserWorkspace for user ${userId}`, err);
      throw err;
    }
  }

  // Elimina un usuario de un workspace específico
  async removeUserFromWorkspace(userId: string, workspaceId: string) {
    this.logger.log(`Removing UserWorkspace for user ${userId} from workspace ${workspaceId}`);
    try {
      const entity = await this.usersWorkspacesDBService.repository.findOne({
        where: {
          user: { id: userId },
          workspace: { id: workspaceId },
        },
      });

      if (!entity) {
        this.logger.warn(`UserWorkspace for user ${userId} in workspace ${workspaceId} not found`);
        throw new Error('UserWorkspace not found');
      }

      const removed = await this.usersWorkspacesDBService.repository.remove(entity);
      this.logger.log(`UserWorkspace for user ${userId} removed successfully`);
      return removed;
    } catch (err) {
      this.logger.error(`Error removing UserWorkspace for user ${userId}`, err);
      throw err;
    }
  }
}
