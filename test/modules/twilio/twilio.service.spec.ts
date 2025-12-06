import { Test, TestingModule } from '@nestjs/testing';
import { TwilioService } from '../../../src/app/modules/twilio/twilio.service';
import { ConfigService } from '@nestjs/config';

import * as Twilio from 'twilio';

jest.mock('twilio', () => {
  const mockCallsCreate = jest.fn().mockResolvedValue({ sid: 'CALL_SID_123' });

  return {
    Twilio: jest.fn().mockImplementation(() => ({
      calls: { create: mockCallsCreate },
    })),
    twiml: {
      VoiceResponse: jest.fn().mockImplementation(() => {
        const connectObj = {
          addChild: jest.fn().mockReturnValue({
            addChild: jest.fn(),
          }),
        };

        return {
          connect: () => connectObj,
          toString: () => '<Response></Response>',
        };
      }),
    },
  };
});

describe('TwilioService', () => {
  let service: TwilioService;
  let config: jest.Mocked<ConfigService>;

  const mockAgent = { id: 'A1' } as any;
  const mockCard = { id: 'C1', contactPhone: '+123456789' } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwilioService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const vars = {
                TWILIO_ACCOUNT_SID: 'AC_TEST',
                TWILIO_AUTH_TOKEN: 'AUTH_TEST',
                TWILIO_FROM_NUMBER: '+100200300',
              };
              return vars[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TwilioService>(TwilioService);
    config = module.get(ConfigService);
  });

  // -------------------------------------------------------
  // generateConversationRelayTwiML()
  // -------------------------------------------------------
  describe('generateConversationRelayTwiML', () => {
    it('debe generar TwiML correctamente', () => {
      const xml = service.generateConversationRelayTwiML(
        'ws://localhost/ws',
        'AGENT1',
        'CARD1',
        'Hola test'
      );

      expect(xml).toContain('<Response>');
      expect(xml).toContain('</Response>');
    });
  });

  // -------------------------------------------------------
  // initiateCall()
  // -------------------------------------------------------
  describe('initiateCall', () => {
    it('debe lanzar error si TWILIO_FROM_NUMBER no está configurado', async () => {
      config.get.mockImplementation((key: string) =>
        key === 'TWILIO_FROM_NUMBER' ? null : 'value'
      );

      await expect(
        service.initiateCall('+123', mockAgent, 'http://host', mockCard)
      ).rejects.toThrow('TWILIO_FROM_NUMBER not configured');
    });

    it('debe iniciar una llamada con los datos correctos', async () => {
      const sid = await service.initiateCall(
        mockCard.contactPhone,
        mockAgent,
        'http://my-url',
        mockCard
      );

      const twilioInstance = (Twilio as any).Twilio.mock.results[0].value;

      expect(twilioInstance.calls.create).toHaveBeenCalledWith({
        to: mockCard.contactPhone,
        from: '+100200300',
        url: 'http://my-url/twilio/voice?agentId=A1&cardId=C1',
        method: 'GET',
      });

      expect(sid).toBe('CALL_SID_123');
    });
  });
});
