import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  Query,
  Search,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { UserEntity } from '../../../database/entities/user.entity';
import type { RequestWithUser } from '../auth/auth.controller';
import { QueryBoardDto } from './dtos/queryBoard.dto';
import { CreateBoardDto } from './dtos/CreateBoard.dto';

@Controller({ path: 'boards', version: '1' })
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  async create(@Body() body: CreateBoardDto, @Req() req: RequestWithUser) {
    const user = req.user;
    return this.boardsService.createBoard(
      body.title,
      body.description,
      user.id,
      body.memberIds || [],
      body.workspaceId,
      body.color,
    );
  }

  @Get('paginated')
  async findPaginated(@Query() queryBoardDto: QueryBoardDto, @Req() req: RequestWithUser) {
    const user = req.user;
    return this.boardsService.findAll(queryBoardDto, user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.boardsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Partial<CreateBoardDto>) {
    return this.boardsService.updateBoard(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.boardsService.deleteBoard(id);
  }
}
