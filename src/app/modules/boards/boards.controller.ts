import { Body, Controller, Get, Post, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { UserEntity } from '../../../database/entities/user.entity';
import type { Request } from 'express';

interface RequestWithUser extends Request {
  user: UserEntity;
}

interface CreateBoardDto {
  title: string;
  description?: string;
  members?: UserEntity[];
}

interface UpdateBoardDto {
  title?: string;
  description?: string;
  members?: UserEntity[];
}

@Controller({ path: 'boards', version: '1' })
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  async create(@Body() body: CreateBoardDto, @Req() req: RequestWithUser) {
    const user = req.user;
    return this.boardsService.createBoard(body.title, body.description, user, body.members || []);
  }

  @Get()
  async findAll() {
    return this.boardsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.boardsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateBoardDto) {
    return this.boardsService.updateBoard(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.boardsService.deleteBoard(id);
  }
}
