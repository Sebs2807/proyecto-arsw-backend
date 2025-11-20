import { Injectable, Logger } from '@nestjs/common';
import { WorkspaceDBService } from 'src/database/dbservices/workspace.dbservice';
import { WorkspaceEntity } from 'src/database/entities/workspace.entity';

@Injectable()
export class WorkspacesService {
  private readonly logger = new Logger(WorkspacesService.name);

  constructor(private readonly workspaceDBService: WorkspaceDBService) {}

  async createWorkspace(name: string) {
    this.logger.log(`Creating workspace with name: ${name}`);
    try {
      const newWorkspace = this.workspaceDBService.repository.create({ name });
      this.logger.log(`New workspace entity created: ${JSON.stringify(newWorkspace)}`);
      return await this.workspaceDBService.repository.save(newWorkspace);
    } catch (err) {
      this.logger.error('Error creating workspace', err);
      throw err;
    }
  }

  async findAllByIdUser(idUser: string): Promise<WorkspaceEntity[]> {
    try {
      const workspaces = await this.workspaceDBService.getWorkspacesByUserId(idUser);
      return workspaces;
    } catch (err) {
      this.logger.error(`Error fetching workspaces for user ${idUser}`, err);
      throw err;
    }
  }
}
