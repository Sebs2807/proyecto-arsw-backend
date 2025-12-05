import { Controller, Post, Res, Req, Body, Query, Get } from '@nestjs/common';
import type { Response, Request } from 'express';
import { TwilioService } from './twilio.service';
import { ConfigService } from '@nestjs/config';
import { CardService } from '../cards/cards.service';
import { AgentsService } from '../agents/agents.service';
import { OpenAILiveService } from '../ai/services/openAi-live.service';

@Controller('twilio')
export class TwilioController {
  constructor(
    private readonly twilioService: TwilioService,
    private readonly configService: ConfigService,
    private readonly cardService: CardService,
    private readonly agentsService: AgentsService,
    private readonly openaiLive: OpenAILiveService,
  ) {}

  /**
   * POST /twilio/call
   * Inicia la llamada Twilio hacia el número del card
   */
  @Post('call')
  async initiateCall(@Body() body: { cardId: string }) {
    const { cardId } = body;

    console.log(`Iniciando llamada Twilio — cardId: ${cardId}`);

    // Validar card
    const card = await this.cardService.findCardWithFullContext(cardId);
    if (!card?.contactPhone) {
      throw new Error('Card not found or no contact phone');
    }

    const agent = card.list.agent;
    console.log(`Usando agente ${agent.name} para la llamada`);

    // URL pública donde Twilio obtendrá el TwiML
    const host = this.configService.get<string>('PUBLIC_URL') || 'http://localhost:3000';
    console.log(`Usando PUBLIC_URL: ${host}`);

    await this.twilioService.initiateCall(card.contactPhone, agent, host, card);

    return { message: 'Call initiated' };
  }

  /**
   * POST /twilio/voice
   * Endpoint que devuelve TwiML para que Twilio conecte el WS
   */
  @Get('voice')
  async handleVoice(
    @Req() req: Request,
    @Res() res: Response,
    @Query('agentId') agentId: string,
    @Query('cardId') cardId: string,
  ) {
    const host =
      this.configService.get<string>('PUBLIC_URL') || `${req.protocol}://${req.get('host')}`;

    let welcomeGreeting = 'Hola, este es un saludo inicial';

    try {
      // Validar que el cardId existe
      if (cardId) {
        await this.cardService.findOne(cardId);
      }

      if (agentId && cardId) {
        welcomeGreeting = await this.openaiLive.generateFirstGreeting(agentId, cardId);
      }
    } catch (err) {
      console.error('Error obteniendo contexto del card o saludo:', err);
    }

    const wsUrl = `${host.replace(/^http/, 'ws')}/ws/twilio?agentId=${agentId}&cardId=${cardId}`;

    const twiml = this.twilioService.generateConversationRelayTwiML(
      wsUrl,
      agentId,
      cardId,
      welcomeGreeting,
    );

    res.type('text/xml').send(twiml);
  }
}
