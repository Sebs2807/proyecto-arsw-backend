import { Test, TestingModule } from '@nestjs/testing';
import { AgentsController } from '../../../src/app/modules/agents/agents.controller';
import { AgentsService } from '../../../src/app/modules/agents/agents.service';
import { CreateAgentDto } from '../../../src/app/modules/agents/dtos/createAgent.dto';
import { QueryAgentDto } from '../../../src/app/modules/agents/dtos/queryAgent.dto';
import { UpdateAgentDto } from '../../../src/app/modules/agents/dtos/updateAgent.dto';

describe('AgentsController', () => {
  let controller: AgentsController;
  let service: AgentsService;

  const mockAgentsService = {
    createAgent: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateAgent: jest.fn(),
    deleteAgent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentsController],
      providers: [
        {
          provide: AgentsService,
          useValue: mockAgentsService,
        },
      ],
    }).compile();

    controller = module.get<AgentsController>(AgentsController);
    service = module.get<AgentsService>(AgentsService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call service.createAgent with body and return result', async () => {
      const dto: CreateAgentDto = { name: 'John Doe', email: 'john@test.com' };

      const result = { id: '123', ...dto };
      mockAgentsService.createAgent.mockResolvedValue(result);

      const response = await controller.create(dto);

      expect(service.createAgent).toHaveBeenCalledWith(dto);
      expect(response).toEqual(result);
    });
  });

  describe('findPaginated', () => {
    it('should call service.findAll with query params and return paginated result', async () => {
      const query: QueryAgentDto = { limit: 10, page: 1 };

      const result = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };
      mockAgentsService.findAll.mockResolvedValue(result);

      const response = await controller.findPaginated(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(response).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return agent by id', async () => {
      const id = 'abc123';
      const result = { id, name: 'Agent', email: 'agent@mail.com' };

      mockAgentsService.findOne.mockResolvedValue(result);

      const response = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(response).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update agent and return updated data', async () => {
      const id = 'abc123';
      const dto: UpdateAgentDto = { name: 'New Name' };
      const result = { id, name: 'New Name' };

      mockAgentsService.updateAgent.mockResolvedValue(result);

      const response = await controller.update(id, dto);

      expect(service.updateAgent).toHaveBeenCalledWith(id, dto);
      expect(response).toEqual(result);
    });
  });


  describe('remove', () => {
    it('should delete agent by id', async () => {
      const id = 'abc123';
      const result = { deleted: true };

      mockAgentsService.deleteAgent.mockResolvedValue(result);

      const response = await controller.remove(id);

      expect(service.deleteAgent).toHaveBeenCalledWith(id);
      expect(response).toEqual(result);
    });
  });
});
