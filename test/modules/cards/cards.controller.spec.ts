import { Test, TestingModule } from '@nestjs/testing';
import { CardController } from 'src/app/modules/cards/cards.controller';
import { CardService } from 'src/app/modules/cards/cards.service';
import { CardEntity } from 'src/database/entities/card.entity';
import { ListEntity } from 'src/database/entities/list.entity';

describe('CardController', () => {
  let controller: CardController;
  let service: CardService;

  const mockList: ListEntity = {
    id: '1',
    title: 'List 1',
    order: 0,
    cards: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    board: null as any,
    agent: null as any,
  } as ListEntity;

  const mockCard: CardEntity = {
    id: '1',
    title: 'Card 1',
    description: 'Description',
    status: 'new',
    list: mockList,
    createdAt: new Date(),
    updatedAt: new Date(),
    contactName: 'Mock Contact',
    contactPhone: '555-1234',
    contactEmail: 'mock@example.com',
    industry: 'Tech',
    priority: 'medium',
    conversationState: undefined,
    dueDate: undefined,
  } as CardEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
      providers: [
        {
          provide: CardService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CardController>(CardController);
    service = module.get<CardService>(CardService);
  });

  it('should get all cards', async () => {
    jest.spyOn(service, 'findAll').mockResolvedValue([mockCard]);
    expect(await controller.findAll()).toEqual([mockCard]);
  });

  it('should get one card', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue(mockCard);
    expect(await controller.findOne('1')).toEqual(mockCard);
  });

  it('should create a card', async () => {
    const createDto = { title: 'Card 1', listId: '1' }; // Correct DTO structure, including listId
    jest.spyOn(service, 'create').mockResolvedValue(mockCard);

    // Call the controller with the single DTO argument (no listId in path/query)
    expect(await controller.create(createDto as any)).toEqual(mockCard);

    // Assert the service was called with the complete DTO as a single argument
    expect(service.create).toHaveBeenCalledWith(createDto);
  });

  it('should update a card', async () => {
    const updated = { ...mockCard, title: 'Updated' };
    jest.spyOn(service, 'update').mockResolvedValue(updated);
    expect(await controller.update('1', { title: 'Updated' })).toEqual(updated);
  });

  it('should delete a card', async () => {
    jest.spyOn(service, 'delete').mockResolvedValue();
    await controller.remove('1');
    expect(service.delete).toHaveBeenCalledWith('1');
  });
});
