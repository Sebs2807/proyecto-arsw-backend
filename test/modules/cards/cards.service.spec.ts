import { NotFoundException } from '@nestjs/common';
import { CardService } from 'src/app/modules/cards/cards.service';
import { CardEntity } from '../../../src/database/entities/card.entity';
import { ListEntity } from '../../../src/database/entities/list.entity';
import { Repository } from 'typeorm';
import { RealtimeGateway } from 'src/gateways/realtime.gateway';

describe('CardService', () => {
  let service: CardService;
  let cardRepository: jest.Mocked<Repository<CardEntity>>;
  let listRepository: jest.Mocked<Repository<ListEntity>>;
  let realtimeGateway: jest.Mocked<RealtimeGateway>;

  beforeEach(() => {
    cardRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as any;

    listRepository = {
      findOne: jest.fn(),
    } as any;

    realtimeGateway = {
      emitGlobalUpdate: jest.fn(),
    } as any;

    service = new CardService(cardRepository, listRepository, realtimeGateway);
  });

  it('debería retornar todas las tarjetas con sus listas', async () => {
    const cards = [{ id: '1', title: 'Tarea 1' }] as CardEntity[];
    cardRepository.find.mockResolvedValue(cards);

    const result = await service.findAll();

    expect(cardRepository.find).toHaveBeenCalledWith({ relations: ['list'] });
    expect(result).toEqual(cards);
  });

  it('debería retornar una tarjeta por id', async () => {
    const card = { id: '1', title: 'Tarea 1' } as CardEntity;
    cardRepository.findOne.mockResolvedValue(card);

    const result = await service.findOne('1');

    expect(cardRepository.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
      relations: ['list'],
    });
    expect(result).toBe(card);
  });

  it('debería lanzar NotFoundException si la tarjeta no existe', async () => {
    cardRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('99')).rejects.toThrow(NotFoundException);
  });

  it('debería crear una tarjeta correctamente', async () => {
    const list = { id: '1', name: 'Lista 1' } as unknown as ListEntity;

    // FIX 1: Define the DTO (includes listId) and the payload (data without listId) separately
    const listId = '1';
    const cardPayload = { title: 'Nueva tarjeta' }; // Data passed to cardRepository.create
    const createDto = { ...cardPayload, listId } as any;

    const savedCard = { id: '123', ...cardPayload, list } as CardEntity;

    listRepository.findOne.mockResolvedValue(list);
    cardRepository.create.mockReturnValue(savedCard);
    cardRepository.save.mockResolvedValue(savedCard);

    // FIX 1: Llamar al servicio con el DTO completo como único argumento.
    const result = await service.create(createDto);

    expect(listRepository.findOne).toHaveBeenCalledWith({ where: { id: listId } });
    // FIX 2: Ensure the expectation matches the payload after destructuring in the service.
    expect(cardRepository.create).toHaveBeenCalledWith({ ...cardPayload, list });
    expect(cardRepository.save).toHaveBeenCalledWith(savedCard);
    expect(realtimeGateway.emitGlobalUpdate).toHaveBeenCalledWith('card:created', {
      listId: listId,
      card: savedCard,
    });
    expect(result).toBe(savedCard);
  });

  it('debería lanzar NotFoundException si la lista no existe al crear', async () => {
    listRepository.findOne.mockResolvedValue(null);

    await expect(service.create({ listId: '99' } as any)).rejects.toThrow(NotFoundException);
  });

  it('debería actualizar una tarjeta correctamente', async () => {
    const list = { id: '1', name: 'Lista 1' } as unknown as ListEntity;
    const card = { id: '123', title: 'Vieja', list } as CardEntity;
    const updatedCard = { ...card, title: 'Nueva' } as CardEntity;

    cardRepository.findOne.mockResolvedValue(card);
    cardRepository.save.mockResolvedValue(updatedCard);

    const result = await service.update('123', { title: 'Nueva' });

    expect(cardRepository.findOne).toHaveBeenCalledWith({
      where: { id: '123' },
      relations: ['list'],
    });
    expect(realtimeGateway.emitGlobalUpdate).toHaveBeenCalledWith('card:moved', expect.any(Object));
    expect(result.title).toBe('Nueva');
  });

  it('debería lanzar NotFoundException si la tarjeta no existe al actualizar', async () => {
    cardRepository.findOne.mockResolvedValue(null);

    await expect(service.update('99', {})).rejects.toThrow(NotFoundException);
  });

  it('debería actualizar la lista asociada de una tarjeta', async () => {
    const oldList = { id: '1', name: 'Antigua' } as unknown as ListEntity;
    const newList = { id: '2', name: 'Nueva' } as unknown as ListEntity;
    const card = { id: '123', title: 'Card', list: oldList } as CardEntity;

    cardRepository.findOne.mockResolvedValue(card);
    listRepository.findOne.mockResolvedValue(newList);
    cardRepository.save.mockResolvedValue({ ...card, list: newList });

    const result = await service.update('123', { listId: '2' } as any);

    expect(listRepository.findOne).toHaveBeenCalledWith({ where: { id: '2' } });
    expect(result.list).toEqual(newList);
  });

  it('debería lanzar NotFoundException si la nueva lista no existe', async () => {
    // FIX 2: La tarjeta debe tener la relación 'list' definida para evitar el TypeError.
    const oldList = { id: '1', name: 'Antigua' } as unknown as ListEntity;
    const card = { id: '123', title: 'Card', list: oldList } as CardEntity;

    cardRepository.findOne.mockResolvedValue(card); // Devuelve la tarjeta con list.id
    listRepository.findOne.mockResolvedValue(null); // No encuentra la nueva lista

    await expect(service.update('123', { listId: '99' } as any)).rejects.toThrow(NotFoundException);
  });

  it('debería eliminar una tarjeta correctamente', async () => {
    const list = { id: '1', name: 'Lista 1' } as unknown as ListEntity;
    const card = { id: '123', title: 'Card', list } as CardEntity;
    cardRepository.findOne.mockResolvedValue(card);
    cardRepository.delete.mockResolvedValue({ affected: 1 } as any);

    await service.delete('123');

    expect(cardRepository.delete).toHaveBeenCalledWith('123');
    expect(realtimeGateway.emitGlobalUpdate).toHaveBeenCalledWith('card:deleted', {
      listId: '1',
      cardId: '123',
    });
  });

  it('debería lanzar NotFoundException si la tarjeta no existe al eliminar', async () => {
    cardRepository.findOne.mockResolvedValue(null);
    await expect(service.delete('999')).rejects.toThrow(NotFoundException);
  });
});
