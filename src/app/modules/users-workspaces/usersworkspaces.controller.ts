import { Controller, Post, Body, Patch, Delete, UseGuards } from '@nestjs/common';
import { UsersWorkspacesService } from './usersworkspaces.service';
import { AddUserToWorkspaceDto } from './dtos/addUserToWorspace.dto';
import { UpdateUserWorkspaceDto } from './dtos/updateUserWorkspace.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller({ path: 'workspaces/users', version: '1' })
@UseGuards(JwtAuthGuard)
export class UsersWorkspacesController {
  constructor(private readonly usersWorkspacesService: UsersWorkspacesService) {}

  @Post()
  async addUserToWorkspace(@Body() body: AddUserToWorkspaceDto) {
    const { userId, workspaceId, role } = body;
    return this.usersWorkspacesService.addUserToWorkspace(userId, workspaceId, role);
  }

  @Patch()
  async updateUserWorkspace(@Body() body: UpdateUserWorkspaceDto) {
    const { userId, workspaceId, role } = body;
    return this.usersWorkspacesService.updateUserWorkspace(userId, workspaceId, role);
  }

  @Delete()
  async removeUserFromWorkspace(@Body() body: { userId: string; workspaceId: string }) {
    const { userId, workspaceId } = body;
    return this.usersWorkspacesService.removeUserFromWorkspace(userId, workspaceId);
  }
}
