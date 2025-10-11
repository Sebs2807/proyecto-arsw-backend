// src/modules/lists/lists.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ListService } from './lists.service';
import { ListEntity } from '../../../database/entities/list.entity';

@Controller('lists')
export class ListController {
  constructor(private readonly listService: ListService) {}


  @Get(':id')
  findOne(@Param('id') id: string): Promise<ListEntity | null> {
    return this.listService.findOne(id);
  }


  @Post()
  create(@Body() listData: Partial<ListEntity>): Promise<ListEntity> {
    return this.listService.create(listData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() listData: Partial<ListEntity>): Promise<ListEntity | null> {
    return this.listService.update(id, listData);
  }


  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.listService.delete(id);
  }
}
