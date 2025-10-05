import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':email')
  async findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }
}
