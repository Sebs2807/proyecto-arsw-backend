import { Controller, Get, Post, Body, Param, Put, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ListService } from './lists.service';
import { ListDto } from './dtos/list.dto';
import { CreateListDto } from './dtos/createList.dto';
import { UpdateListDto } from './dtos/updateList.dto';

@ApiTags('Lists')
@Controller({ path: 'lists', version: '1' })
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Get('board/:boardId')
  @ApiOperation({ summary: 'Obtener todas las listas de un tablero específico' })
  @ApiParam({
    name: 'boardId',
    description: 'Identificador del tablero',
    example: 'cba24a11-8f94-42ef-9b61-5cd71d6f3c81',
  })
  @ApiResponse({
    status: 200,
    description: 'Listas obtenidas correctamente',
    type: [ListDto],
  })
  findAllByBoard(@Param('boardId', new ParseUUIDPipe()) boardId: string): Promise<ListDto[]> {
    return this.listService.findAllByBoard(boardId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una lista por su identificador' })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la lista',
    example: 'd9b8f23e-12f4-45c8-8230-9d4ab87a77f1',
  })
  @ApiResponse({ status: 200, description: 'Lista encontrada', type: ListDto })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<ListDto> {
    return this.listService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva lista dentro de un tablero' })
  @ApiResponse({ status: 201, description: 'Lista creada exitosamente', type: ListDto })
  create(@Body() createListDto: CreateListDto): Promise<ListDto> {
    return this.listService.create(createListDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una lista existente' })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la lista',
    example: 'd9b8f23e-12f4-45c8-8230-9d4ab87a77f1',
  })
  @ApiResponse({ status: 200, description: 'Lista actualizada correctamente', type: ListDto })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateListDto: UpdateListDto,
  ): Promise<ListDto> {
    return this.listService.update(id, updateListDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una lista por su identificador' })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la lista',
    example: 'd9b8f23e-12f4-45c8-8230-9d4ab87a77f1',
  })
  @ApiResponse({ status: 204, description: 'Lista eliminada correctamente' })
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.listService.delete(id);
  }
}
