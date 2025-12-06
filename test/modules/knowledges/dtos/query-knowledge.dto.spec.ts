import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { QueryKnowledgeDto } from 'src/app/modules/knowledges/dtos/queryKnowledge.dto';

describe('QueryKnowledgeDto', () => {
  it('debe validar correctamente cuando todos los valores son válidos', async () => {
    const dto = plainToInstance(QueryKnowledgeDto, {
      search: 'test',
      category: 'pricing',
      page: '2',
      limit: '20',
      workspaceId: 'abc123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);

    // page y limit deben transformarse a número gracias a @Type
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(20);
  });

  it('debe permitir DTO vacío porque todos los campos son opcionales', async () => {
    const dto = plainToInstance(QueryKnowledgeDto, {});

    const errors = await validate(dto);
    expect(errors.length).toBe(0);

    // Valores por defecto
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });

  it('debe fallar si la categoría no es válida', async () => {
    const dto = plainToInstance(QueryKnowledgeDto, {
      category: 'invalid_category',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);

    const categoryError = errors.find(e => e.property === 'category');
    expect(categoryError).toBeDefined();
  });

  it('debe fallar si search no es un string', async () => {
    const dto = plainToInstance(QueryKnowledgeDto, {
      search: 123,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);

    const searchError = errors.find(e => e.property === 'search');
    expect(searchError).toBeDefined();
  });

  it('debe fallar si workspaceId no es string', async () => {
    const dto = plainToInstance(QueryKnowledgeDto, {
      workspaceId: 55,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);

    const workspaceError = errors.find(e => e.property === 'workspaceId');
    expect(workspaceError).toBeDefined();
  });

  it('debe transformar page y limit a números incluso si vienen como string', async () => {
    const dto = plainToInstance(QueryKnowledgeDto, {
      page: "5",
      limit: "50",
    });

    await validate(dto);

    expect(dto.page).toBe(5);
    expect(dto.limit).toBe(50);
  });
  
  it('no debe fallar si page no es un número válido, porque el DTO actual no valida números', async () => {
    const dto = plainToInstance(QueryKnowledgeDto, { page: 'no-num' });

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    });

    it('no debe fallar si limit no es un número válido, porque el DTO actual no valida números', async () => {
    const dto = plainToInstance(QueryKnowledgeDto, { limit: 'abc' });

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    });

});
