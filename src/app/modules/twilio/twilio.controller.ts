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
  async initiateCall(@Body() body: { cardId: string; agentId: string }) {
    const { cardId, agentId } = body;

    console.log(`Iniciando llamada Twilio — cardId: ${cardId}, agentId: ${agentId}`);

    // Validar card
    const card = await this.cardService.findOne(cardId);
    if (!card || !card.contactPhone) {
      throw new Error('Card not found or no contact phone');
    }

    // Validar agent
    const agent = await this.agentsService.findOne(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // URL pública donde Twilio obtendrá el TwiML
    const host = this.configService.get<string>('PUBLIC_URL') || 'http://localhost:3000';
    console.log(`Usando PUBLIC_URL: ${host}`);

    await this.twilioService.initiateCall(card.contactPhone, agentId, host);

    return { message: 'Call initiated' };
  }

  /**
   * POST /twilio/voice
   * Endpoint que devuelve TwiML para que Twilio conecte el WS
   */
  @Get('voice')
  async handleVoice(@Req() req: Request, @Res() res: Response, @Query('agentId') agentId: string) {
    const host =
      this.configService.get<string>('PUBLIC_URL') || `${req.protocol}://${req.get('host')}`;
    const wsUrl = `${host.replace(/^http/, 'ws')}/ws/twilio?agentId=${agentId}`;

    let welcomeGreeting = 'Hola, este es un saludo inicial';
    try {
      if (agentId) {
        welcomeGreeting = await this.openaiLive.generateFirstGreeting(agentId);
      }
    } catch (err) {
      console.error('Error generando saludo OpenAI:', err);
    }

    const twiml = this.twilioService.generateConversationRelayTwiML(
      wsUrl,
      agentId,
      welcomeGreeting,
    );

    res.type('text/xml').send(twiml);
  }
}
