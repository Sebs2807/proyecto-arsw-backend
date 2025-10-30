// import { Test, TestingModule } from '@nestjs/testing';
// import { CardController } from 'src/app/modules/cards/cards.controller';
// import { CardService } from 'src/app/modules/cards/cards.service';
// import { CardEntity } from 'src/database/entities/card.entity';
// import { ListEntity } from 'src/database/entities/list.entity';

// describe('CardController', () => {
//   let controller: CardController;
//   let service: CardService;

//   const mockList: ListEntity = {
//     id: '1',
//     title: 'List 1',
//     order: 0,
//     cards: [],
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   } as ListEntity;

//   const mockCard: CardEntity = {
//     id: '1',
//     title: 'Card 1',
//     description: 'Description',
//     status: 'new',
//     list: mockList,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   } as CardEntity;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [CardController],
//       providers: [
//         {
//           provide: CardService,
//           useValue: {
//             findAll: jest.fn(),
//             findOne: jest.fn(),
//             create: jest.fn(),
//             update: jest.fn(),
//             delete: jest.fn(),
//           },
//         },
//       ],
//     }).compile();

//     controller = module.get<CardController>(CardController);
//     service = module.get<CardService>(CardService);
//   });

//   it('should get all cards', async () => {
//     jest.spyOn(service, 'findAll').mockResolvedValue([mockCard]);
//     expect(await controller.findAll()).toEqual([mockCard]);
//   });

//   it('should get one card', async () => {
//     jest.spyOn(service, 'findOne').mockResolvedValue(mockCard);
//     expect(await controller.findOne('1')).toEqual(mockCard);
//   });

//   it('should create a card', async () => {
//     jest.spyOn(service, 'create').mockResolvedValue(mockCard);
//     expect(await controller.create({ title: 'Card 1' }, '1')).toEqual(mockCard);
//     expect(service.create).toHaveBeenCalledWith({ title: 'Card 1' }, '1');
//   });

//   it('should update a card', async () => {
//     const updated = { ...mockCard, title: 'Updated' };
//     jest.spyOn(service, 'update').mockResolvedValue(updated);
//     expect(await controller.update('1', { title: 'Updated' })).toEqual(updated);
//   });

//   it('should delete a card', async () => {
//     jest.spyOn(service, 'delete').mockResolvedValue();
//     await controller.remove('1');
//     expect(service.delete).toHaveBeenCalledWith('1');
//   });
// });
