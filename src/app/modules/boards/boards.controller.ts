import { Body, Controller, Get, Post, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guar';
import { UserEntity } from '../../../database/entities/user.entity';
import { ParseIntPipe } from '@nestjs/common';

@Controller({ path: 'boards', version: '1' })
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  async create(
    @Body() body: { title: string; description?: string; members?: UserEntity[] },
    @Req() req,
  ) {
    const user = req.user;
    return this.boardsService.createBoard(body.title, body.description, user, body.members || []);
  }

  @Get()
  async findAll() {
    return this.boardsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.boardsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() body: any) {
    return this.boardsService.updateBoard(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.boardsService.deleteBoard(id);
  }
}
