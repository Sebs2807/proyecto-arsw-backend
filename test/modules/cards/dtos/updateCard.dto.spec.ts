// test/modules/cards/dtos/updateCard.dto.spec.ts

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateCardDto } from '../../../../src/app/modules/cards/dtos/updateCard.dto';

describe('UpdateCardDto', () => {
  const baseDto = {
    title: 'Actualizar seguimiento con el cliente',
    description: 'Se deben confirmar los términos del nuevo contrato',
    status: 'in_progress',
    priority: 'high',
    listId: '6f5d4c3b-2a1e-4d9b-9c5f-8a1b2c3d4e5f',
    dueDate: '2025-12-10T18:00:00.000Z',
  };

  it('debería ser válido con todos los campos correctos', async () => {
    const dto = plainToInstance(UpdateCardDto, baseDto);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería ser válido con solo un campo (por ejemplo, title)', async () => {
    const dto = plainToInstance(UpdateCardDto, { title: 'Nuevo título' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si el título es una cadena vacía', async () => {
    const dto = plainToInstance(UpdateCardDto, { title: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
  });

  it('debería fallar si el título supera los 100 caracteres', async () => {
    const dto = plainToInstance(UpdateCardDto, { title: 'a'.repeat(101) });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('debería permitir descripción vacía o no definida', async () => {
    const dto = plainToInstance(UpdateCardDto, { description: undefined });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si la descripción supera los 500 caracteres', async () => {
    const dto = plainToInstance(UpdateCardDto, { description: 'a'.repeat(501) });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('debería fallar si el estado no pertenece al conjunto permitido', async () => {
    const dto = plainToInstance(UpdateCardDto, { status: 'invalid' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
  });

  it('debería fallar si la prioridad no pertenece al conjunto permitido', async () => {
    const dto = plainToInstance(UpdateCardDto, { priority: 'extreme' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('priority');
  });

  it('debería fallar si el listId no es un UUID válido', async () => {
    const dto = plainToInstance(UpdateCardDto, { listId: '1234' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('listId');
  });

  it('debería aceptar un UUID válido en listId', async () => {
    const dto = plainToInstance(UpdateCardDto, { listId: '6f5d4c3b-2a1e-4d9b-9c5f-8a1b2c3d4e5f' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si la fecha no es un formato ISO válido', async () => {
    const dto = plainToInstance(UpdateCardDto, { dueDate: 'fecha-invalida' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('dueDate');
  });

  it('debería ser válido si no se define dueDate', async () => {
    const dto = plainToInstance(UpdateCardDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
