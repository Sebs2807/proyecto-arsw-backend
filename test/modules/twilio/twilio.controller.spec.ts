import { Test, TestingModule } from '@nestjs/testing';
import { TwilioController } from '../../../src/app/modules/twilio/twilio.controller';
import { TwilioService } from '../../../src/app/modules/twilio/twilio.service';
import { ConfigService } from '@nestjs/config';
import { CardService } from '../../../src/app/modules/cards/cards.service';
import { AgentsService } from '../../../src/app/modules/agents/agents.service';
import { OpenAILiveService } from '../../../src/app/modules/ai/services/openAi-live.service';

describe('TwilioController', () => {
  let controller: TwilioController;

  let twilioService: jest.Mocked<TwilioService>;
  let configService: jest.Mocked<ConfigService>;
  let cardService: jest.Mocked<CardService>;
  let agentsService: jest.Mocked<AgentsService>;
  let openaiLiveService: jest.Mocked<OpenAILiveService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TwilioController],
      providers: [
        {
          provide: TwilioService,
          useValue: {
            initiateCall: jest.fn(),
            generateConversationRelayTwiML: jest.fn().mockReturnValue('<Response></Response>')
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:3000'),
          },
        },
        {
          provide: CardService,
          useValue: {
            findCardWithFullContext: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: AgentsService,
          useValue: {},
        },
        {
          provide: OpenAILiveService,
          useValue: {
            generateFirstGreeting: jest.fn().mockResolvedValue('Hola desde IA'),
          },
        },
      ],
    }).compile();

    controller = module.get<TwilioController>(TwilioController);
    twilioService = module.get(TwilioService);
    configService = module.get(ConfigService);
    cardService = module.get(CardService);
    agentsService = module.get(AgentsService);
    openaiLiveService = module.get(OpenAILiveService);
  });

  // -------------------------------------------------------
  // POST /twilio/call
  // -------------------------------------------------------
  describe('POST /twilio/call', () => {
    it('debe iniciar la llamada cuando todo es correcto', async () => {
      cardService.findCardWithFullContext.mockResolvedValue({
        contactPhone: '+123456',
        list: {
          agent: {
            name: 'AgenteTest',
          },
        },
      });

      const result = await controller.initiateCall({ cardId: 'card123' });

      expect(cardService.findCardWithFullContext).toHaveBeenCalledWith('card123');
      expect(twilioService.initiateCall).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Call initiated' });
    });

    it('debe lanzar error si el card no existe o no tiene teléfono', async () => {
      cardService.findCardWithFullContext.mockResolvedValue(null);

      await expect(controller.initiateCall({ cardId: 'card123' })).rejects.toThrow(
        'Card not found or no contact phone',
      );
    });
  });

  // -------------------------------------------------------
  // GET /twilio/voice
  // -------------------------------------------------------
  describe('GET /twilio/voice', () => {
    const mockReq = { protocol: 'http', get: () => 'localhost:3000' } as any;
    const mockRes = {
      type: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as any;

    it('debe devolver TwiML correctamente', async () => {
      cardService.findOne.mockResolvedValue({ id: 'card123' });

      await controller.handleVoice(mockReq, mockRes, 'agentABC', 'card123');

      expect(cardService.findOne).toHaveBeenCalledWith('card123');
      expect(openaiLiveService.generateFirstGreeting).toHaveBeenCalled();
      expect(twilioService.generateConversationRelayTwiML).toHaveBeenCalled();

      expect(mockRes.type).toHaveBeenCalledWith('text/xml');
      expect(mockRes.send).toHaveBeenCalledWith('<Response></Response>');
    });

    it('debe manejar errores sin romper y responder TwiML', async () => {
      cardService.findOne.mockRejectedValue(new Error('DB error'));

      await controller.handleVoice(mockReq, mockRes, 'agentABC', 'card123');

      expect(mockRes.type).toHaveBeenCalledWith('text/xml');
      expect(mockRes.send).toHaveBeenCalledWith('<Response></Response>');
    });
  });
});
