// test/modules/cards/dtos/createCard.dto.spec.ts

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCardDto } from '../../../../src/app/modules/cards/dtos/createCard.dto';

describe('CreateCardDto', () => {
  const validDto = {
    title: 'Llamar al proveedor para confirmar pedido',
    description: 'Verificar disponibilidad de productos antes del viernes',
    status: 'new',
    priority: 'medium',
    listId: '8b07e0a2-3c2a-4e7a-b1f2-9d8c2b1e4f0a',
    dueDate: '2025-12-05T17:00:00.000Z',
  };

  it('debería ser válido con todos los campos correctos', async () => {
    const dto = plainToInstance(CreateCardDto, validDto);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si falta el título', async () => {
    const dto = plainToInstance(CreateCardDto, { ...validDto, title: undefined });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
  });

  it('debería fallar si el título está vacío', async () => {
    const dto = plainToInstance(CreateCardDto, { ...validDto, title: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
  });

  it('debería fallar si el título excede 100 caracteres', async () => {
    const dto = plainToInstance(CreateCardDto, { ...validDto, title: 'a'.repeat(101) });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('debería permitir descripción vacía o no definida', async () => {
    const dto = plainToInstance(CreateCardDto, { ...validDto, description: undefined });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si la descripción supera 500 caracteres', async () => {
    const dto = plainToInstance(CreateCardDto, { ...validDto, description: 'a'.repeat(501) });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('debería fallar si el status no es válido', async () => {
    const dto = plainToInstance(CreateCardDto, { ...validDto, status: 'invalid' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
  });

  it('debería fallar si la prioridad no es válida', async () => {
    const dto = plainToInstance(CreateCardDto, { ...validDto, priority: 'extreme' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('priority');
  });

  it('debería fallar si el listId no es un UUID válido', async () => {
    const dto = plainToInstance(CreateCardDto, { ...validDto, listId: '123' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('listId');
  });

  it('debería fallar si la fecha no es ISO válida', async () => {
    const dto = plainToInstance(CreateCardDto, { ...validDto, dueDate: 'not-a-date' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('dueDate');
  });

  it('debería ser válido si no se define dueDate', async () => {
    const dto = plainToInstance(CreateCardDto, { ...validDto, dueDate: undefined });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
