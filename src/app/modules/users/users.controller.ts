import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from 'src/database/entities/user.entity';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('paginated')
  async findPaginated(@Query('page') page = 1, @Query('limit') limit = 10) {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    return this.usersService.findAll(pageNumber, limitNumber);
  }

  @Get(':email')
  async findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  async create(@Body() body: any) {
    return this.usersService.create(body);
  }

  // Update user
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


