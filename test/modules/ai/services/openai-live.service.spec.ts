import { Test, TestingModule } from '@nestjs/testing';
import { OpenAILiveService } from 'src/app/modules/ai/services/openAi-live.service';
import { AgentsService } from 'src/app/modules/agents/agents.service';
import { KnowledgeService } from 'src/app/modules/knowledges/knowledges.service';
import { CardService } from 'src/app/modules/cards/cards.service';

// ===============================
//   MOCK GLOBAL DE OPENAI
// ===============================
const mockOpenAIChat = {
  completions: {
    create: jest.fn(),
  },
};

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: mockOpenAIChat,
  }));
});

import OpenAI from 'openai';

describe('OpenAILiveService', () => {
  let service: OpenAILiveService;
  let agentsService: jest.Mocked<AgentsService>;
  let knowledgeService: jest.Mocked<KnowledgeService>;
  let cardService: jest.Mocked<CardService>;

  // =============================================================
  //                       MOCKS DE RESPUESTAS
  // =============================================================

  const mockFirstGreetingResponse = {
    choices: [
      {
        message: {
          content: 'Hola, este es el saludo inicial.',
        },
      },
    ],
  };

  const mockRunAgentResponse = {
    choices: [
      {
        message: {
          content: JSON.stringify({
            reply: 'Hola, ¿cómo estás?',
            shouldMoveNext: true,
            nextNode: 'qualification',
            reason: 'Objetivo cumplido',
          }),
        },
      },
    ],
  };

  // =============================================================
  //                       MOCK SERVICES
  // =============================================================
  const mockAgent = {
    name: 'Agente Test',
    flowConfig: {
      nodes: {
        greeting: { goal: 'Saludar y presentarse' },
      },
    },
    temperature: 0.5,
    maxTokens: 100,
  };

  const mockCard: any = {
    id: 'card1',
    contactName: 'Juan',
    title: 'Empresa Test',
    industry: 'Tech',
    priority: 'Alta',
    conversationState: { history: [] },
  };

  beforeEach(async () => {
    mockOpenAIChat.completions.create.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAILiveService,
        {
          provide: AgentsService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockAgent),
          },
        },
        {
          provide: KnowledgeService,
          useValue: {
            search: jest.fn().mockResolvedValue([
              { payload: { title: 'Saludo', text: 'Usar tono amable' } },
            ]),
          },
        },
        {
          provide: CardService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockCard),
            updateConversationState: jest.fn().mockResolvedValue(true),
            realtimeGateway: {
              emitGlobalUpdate: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<OpenAILiveService>(OpenAILiveService);
    agentsService = module.get(AgentsService);
    knowledgeService = module.get(KnowledgeService);
    cardService = module.get(CardService);
  });

  // =============================================================
  //                     TEST: generateFirstGreeting()
  // =============================================================
  describe('generateFirstGreeting', () => {
    it('debe generar un saludo inicial correctamente', async () => {
      mockOpenAIChat.completions.create.mockResolvedValueOnce(
        mockFirstGreetingResponse,
      );

      const greeting = await service.generateFirstGreeting('agent1', 'card1');

      expect(agentsService.findOne).toHaveBeenCalledWith('agent1');
      expect(cardService.findOne).toHaveBeenCalledWith('card1');
      expect(knowledgeService.search).toHaveBeenCalled();
      expect(mockOpenAIChat.completions.create).toHaveBeenCalled();
      expect(cardService.updateConversationState).toHaveBeenCalled();

      expect(greeting).toBe('Hola, este es el saludo inicial.');
    });

    it('debe manejar errores y devolver un fallback', async () => {
      mockOpenAIChat.completions.create.mockRejectedValueOnce(
        new Error('OpenAI error'),
      );

      const result = await service.generateFirstGreeting('agent1', 'card1');

      expect(result).toBe('Hola, te habla nuestro asistente virtual.');
    });
  });

  // =============================================================
  //                     TEST: runAgent()
  // =============================================================
  describe('runAgent', () => {
    const conversationState = { currentNode: 'greeting' };

    const prospect = {
      contactName: 'Juan',
      company: 'Empresa Test',
      contactPhone: '12345',
    };

    it('debe ejecutar el agente y devolver JSON válido', async () => {
      mockOpenAIChat.completions.create.mockResolvedValueOnce(
        mockRunAgentResponse,
      );

      const res = await service.runAgent(
        'agent1',
        'Hola',
        conversationState,
        prospect,
      );

      expect(agentsService.findOne).toHaveBeenCalledWith('agent1');
      expect(knowledgeService.search).toHaveBeenCalled();

      expect(res).toEqual({
        reply: 'Hola, ¿cómo estás?',
        shouldMoveNext: true,
        nextNode: 'qualification',
        reason: 'Objetivo cumplido',
      });
    });

    it('debe lanzar error si OpenAI no devuelve contenido', async () => {
      mockOpenAIChat.completions.create.mockResolvedValueOnce({
        choices: [{ message: { content: null } }],
      });

      await expect(
        service.runAgent('agent1', 'Hola', conversationState, prospect),
      ).rejects.toThrow('No content received from OpenAI');
    });

    it('debe manejar excepciones correctamente', async () => {
      mockOpenAIChat.completions.create.mockRejectedValueOnce(
        new Error('OpenAI error'),
      );

      await expect(
        service.runAgent('agent1', 'Hola', conversationState, prospect),
      ).rejects.toThrow('OpenAI error');
    });
  });
});
