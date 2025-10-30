import { Controller, Get, InternalServerErrorException, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../auth/auth.controller';
import { WorkspacesService } from './workspaces.service';

@Controller({ path: 'workspaces', version: '1' })
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  async getAllWorkspaces(@Req() req: RequestWithUser) {
    try {
      const workspaces = await this.workspacesService.findAllByIdUser(req.user.id);
      return workspaces;
    } catch (err) {
      console.error(`Error fetching workspaces for user ${req.user.id}`, err);
      throw new InternalServerErrorException('Error fetching workspaces');
    }
  }
}
