import { Test, TestingModule } from '@nestjs/testing';
import { ListController } from 'src/app/modules/lists/lists.controller';
import { ListService } from 'src/app/modules/lists/lists.service';
import { ListEntity } from 'src/database/entities/list.entity';

describe('ListController', () => {
  let controller: ListController;
  let service: ListService;

  const mockList: any = {
    id: '1',
    title: 'Test List',
    description: 'Desc',
    order: 0,
    cards: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListController],
      providers: [
        {
          provide: ListService,
          useValue: {
            findAllByBoard: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ListController>(ListController);
    service = module.get<ListService>(ListService);
  });

  it('should find all lists', async () => {
    jest.spyOn(service, 'findAllByBoard' as any).mockResolvedValue([mockList] as any);
    expect(await controller.findAllByBoard('1')).toEqual([mockList]);
  });

  it('should find one list', async () => {
    jest.spyOn(service, 'findOne' as any).mockResolvedValue(mockList as any);
    expect(await controller.findOne('1')).toEqual(mockList);
  });

  it('should create a list', async () => {
    jest.spyOn(service, 'create' as any).mockResolvedValue(mockList as any);
    expect(await controller.create({ title: 'Test List', boardId: '1' } as any)).toEqual(mockList);
  });

  it('should update a list', async () => {
    const updated = { ...mockList, title: 'Updated' } as any;
    jest.spyOn(service, 'update' as any).mockResolvedValue(updated as any);
    expect(await controller.update('1', { title: 'Updated' } as any)).toEqual(updated);
  });

  it('should delete a list', async () => {
    jest.spyOn(service, 'delete').mockResolvedValue();
    await controller.remove('1');
    expect(service.delete).toHaveBeenCalledWith('1');
  });
});
