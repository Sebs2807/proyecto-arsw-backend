import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AgentsDBService } from 'src/database/dbservices/agents.dbservice';
import { CardsDBService } from 'src/database/dbservices/cards.dbservice';

@Injectable()
export class CallService {
  constructor(
    private readonly agentDbService: AgentsDBService,
    private readonly cardDbService: CardsDBService,
  ) {}

  async startCall(agentId: string, cardId: string) {
    const agent = await this.agentDbService.repository.findOne({
      where: { id: agentId },
      relations: ['boards', 'lists'],
    });

    if (!agent) throw new NotFoundException('Agent not found');

    const card = await this.cardDbService.repository.findOne({
      where: { id: cardId },
      relations: ['list'],
    });

    if (!card) throw new NotFoundException('Card not found');

    const belongsToAgent = agent.lists.some((l) => l.id === card.list.id);

    if (!belongsToAgent) {
      throw new ForbiddenException('This agent is not assigned to the list of this card');
    }

    const flow = agent.flowConfig || {};
    const prospectData = {
      name: card.contactName,
      email: card.contactEmail,
      phone: card.contactPhone,
      industry: card.industry,
      cardTitle: card.title,
      cardDescription: card.description,
    };

    const callSession = {
      sessionId: crypto.randomUUID(),
      agentId,
      prospect: prospectData,
      flow,
      startedAt: new Date(),
    };

    // Aquí iría la integración real:
    // await this.openAiService.initializeCall(callSession);
    // await this.elevenLabsService.prepareVoice(agent.voiceId);
    // await this.twilioService.startOutboundCall(prospect.phone);

    return {
      message: 'Call initialized successfully',
      session: callSession,
    };
  }
}
