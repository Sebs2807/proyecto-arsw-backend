import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from 'src/database/entities/user.entity';
import { QueryUserDto } from './dtos/queryUser.dto';
import type { RequestWithUser } from '../auth/auth.controller';
import { use } from 'passport';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('paginated')
  async findPaginated(@Query() queryUserDto: QueryUserDto, @Req() req: RequestWithUser) {
    const user = req.user;

    const response = await this.usersService.findAll(queryUserDto);
    return response;
  }

  @Get(':email')
  async findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Post()
  async create(@Body() body: any) {
    return this.usersService.create(body);
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() body: Partial<UserEntity>) {
    return this.usersService.updateUser(id, body);
  }

  // Delete user
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
