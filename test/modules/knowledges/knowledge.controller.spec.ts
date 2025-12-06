import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeController } from 'src/app/modules/knowledges/knowledges.controller';
import { KnowledgeService } from 'src/app/modules/knowledges/knowledges.service';
import { JwtAuthGuard } from 'src/app/modules/auth/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('KnowledgeController', () => {
  let controller: KnowledgeController;
  let service: KnowledgeService;

  const mockService = {
    createKnowledge: jest.fn(),
    getPaginated: jest.fn(),
    getOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockGuard = {
    canActivate: jest.fn((context: ExecutionContext) => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KnowledgeController],
      providers: [
        {
          provide: KnowledgeService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<KnowledgeController>(KnowledgeController);
    service = module.get<KnowledgeService>(KnowledgeService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear un knowledge', async () => {
      const dto = { title: 'Test', content: 'Hello' };
      const expected = { id: '1', ...dto };

      mockService.createKnowledge.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(result).toEqual(expected);
      expect(service.createKnowledge).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll (paginated)', () => {
    it('debería retornar paginado con filtros', async () => {
      const query = {
        page: 1,
        limit: 10,
        search: 'hola',
        workspaceId: 'agent123',
        category: 'faq',
      };

      const expected = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      mockService.getPaginated.mockResolvedValue(expected);

      const result = await controller.findAll(query);

      expect(result).toEqual(expected);
      expect(service.getPaginated).toHaveBeenCalledWith({
        page: query.page,
        limit: query.limit,
        search: query.search,
        agentId: query.workspaceId,
        category: query.category,
      });
    });
  });

  describe('findOne', () => {
    it('debería retornar un knowledge por id', async () => {
      const id = 'abc123';
      const expected = { id, title: 'Hola' };

      mockService.getOne.mockResolvedValue(expected);

      const result = await controller.findOne(id);

      expect(result).toEqual(expected);
      expect(service.getOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('debería actualizar un knowledge', async () => {
      const id = 'xyz';
      const dto = { title: 'Nuevo título' };
      const expected = { id, ...dto };

      mockService.update.mockResolvedValue(expected);

      const result = await controller.update(id, dto);

      expect(result).toEqual(expected);
      expect(service.update).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('delete', () => {
    it('debería eliminar un knowledge', async () => {
      const id = 'to-delete';
      const expected = { deleted: true };

      mockService.delete.mockResolvedValue(expected);

      const result = await controller.delete(id);

      expect(result).toEqual(expected);
      expect(service.delete).toHaveBeenCalledWith(id);
    });
  });
});
