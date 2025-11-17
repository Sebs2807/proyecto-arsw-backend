import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { QueryBoardDto } from '../../../../src/app/modules/boards/dtos/queryBoard.dto';

describe('QueryBoardDto', () => {
  it('debería ser válido con valores correctos', async () => {
    const dto = plainToInstance(QueryBoardDto, {
      page: 1,
      limit: 10,
      workspaceId: '550e8400-e29b-41d4-a716-446655440000',
      search: 'tablero',
      boardId: 'board-123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si workspaceId no es un UUID', async () => {
    const dto = plainToInstance(QueryBoardDto, {
      workspaceId: 'no-es-uuid',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('workspaceId');
  });

  it('debería fallar si page es menor que 1', async () => {
    const dto = plainToInstance(QueryBoardDto, {
      workspaceId: '550e8400-e29b-41d4-a716-446655440000',
      page: 0,
    });

    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'page')).toBe(true);
  });

  it('debería fallar si limit es mayor que 100', async () => {
    const dto = plainToInstance(QueryBoardDto, {
      workspaceId: '550e8400-e29b-41d4-a716-446655440000',
      limit: 200,
    });

    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'limit')).toBe(true);
  });

  it('debería permitir valores opcionales ausentes', async () => {
    const dto = plainToInstance(QueryBoardDto, {
      workspaceId: '550e8400-e29b-41d4-a716-446655440000',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si search no es string', async () => {
    const dto = plainToInstance(QueryBoardDto, {
      workspaceId: '550e8400-e29b-41d4-a716-446655440000',
      search: 1234,
    });

    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'search')).toBe(true);
  });
});
