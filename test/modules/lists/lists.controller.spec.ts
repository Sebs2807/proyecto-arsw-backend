// import { Test, TestingModule } from '@nestjs/testing';
// import { ListController } from 'src/app/modules/lists/lists.controller';
// import { ListService } from 'src/app/modules/lists/lists.service';
// import { ListEntity } from 'src/database/entities/list.entity';

// describe('ListController', () => {
//   let controller: ListController;
//   let service: ListService;

//   const mockList: ListEntity = {
//     id: '1',
//     title: 'Test List',
//     description: 'Desc',
//     order: 0,
//     cards: [],
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   } as ListEntity;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [ListController],
//       providers: [
//         {
//           provide: ListService,
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

//     controller = module.get<ListController>(ListController);
//     service = module.get<ListService>(ListService);
//   });

//   it('should find all lists', async () => {
//     jest.spyOn(service, 'findAll').mockResolvedValue([mockList]);
//     expect(await controller.findAll()).toEqual([mockList]);
//   });

//   it('should find one list', async () => {
//     jest.spyOn(service, 'findOne').mockResolvedValue(mockList);
//     expect(await controller.findOne('1')).toEqual(mockList);
//   });

//   it('should create a list', async () => {
//     jest.spyOn(service, 'create').mockResolvedValue(mockList);
//     expect(await controller.create({ title: 'Test List' })).toEqual(mockList);
//   });

//   it('should update a list', async () => {
//     const updated = { ...mockList, title: 'Updated' };
//     jest.spyOn(service, 'update').mockResolvedValue(updated);
//     expect(await controller.update('1', { title: 'Updated' })).toEqual(updated);
//   });

//   it('should delete a list', async () => {
//     jest.spyOn(service, 'delete').mockResolvedValue();
//     await controller.remove('1');
//     expect(service.delete).toHaveBeenCalledWith('1');
//   });
// });
