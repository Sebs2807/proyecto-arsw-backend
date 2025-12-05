import {
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server as IOServer, Socket } from 'socket.io';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import * as WebSocket from 'ws';
import { OpenAILiveService } from 'src/app/modules/ai/services/openAi-live.service';
import { CardService } from 'src/app/modules/cards/cards.service';

interface ConversationState {
  currentNode: string;
  history: Array<{ node: string; text: string; timestamp: string }>;
}

interface Prospect {
  contactName: string;
  company: string;
  industry: string;
  contactPhone: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class RealtimeGateway {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server: IOServer;

  private readonly twilioWSServer: WebSocket.Server;

  private debounceTimer: NodeJS.Timeout | null = null;
  private userTextBuffer: string[] = [];
  private readonly DEBOUNCE_DELAY_MS = 500;

  constructor(
    private readonly openaiLive: OpenAILiveService,
    @Inject(forwardRef(() => CardService))
    private readonly cardsService: CardService,
  ) {
    this.twilioWSServer = new WebSocket.Server({ noServer: true });
  }

  // ===================================================
  //   TWILIO: MÉTODOS DE MANEJO DE EVENTOS
  // ===================================================

  private async loadCardState(cardId: string) {
    const card = await this.cardsService.findOne(cardId);

    const conversationState = (card.conversationState as ConversationState) ?? {
      currentNode: 'START',
      history: [],
    };

    const prospect: Prospect = {
      contactName: card.contactName || 'Prospecto',
      company: card.title || 'Empresa',
      industry: card.industry || 'No especificada',
      contactPhone: card.contactPhone || 'No especificado',
    };

    return { conversationState, prospect };
  }

  private async handleSetupEvent(
    data: any,
    current: {
      agentId: string | null;
      cardId: string | null;
      conversationState: ConversationState;
      prospect: Prospect;
    },
  ) {
    if (data.customParameters?.agentId) {
      current.agentId = data.customParameters.agentId;
      this.logger.log(`AgentId configurado: ${current.agentId}`);
    }

    if (data.customParameters?.cardId) {
      current.cardId = data.customParameters.cardId;
      this.logger.log(`CardId configurado: ${current.cardId}`);

      try {
        if (current.cardId === null) {
          this.logger.error('CardId es null, no se puede cargar el estado.');
        } else {
          const loaded = await this.loadCardState(current.cardId);
          current.conversationState = loaded.conversationState;
          current.prospect = loaded.prospect;

          this.logger.log(`Estado cargado: ${current.conversationState.currentNode}`);
        }
      } catch (error) {
        this.logger.error('Error cargando card:', error);
      }
    }
  }

  private handleStartEvent(data: any, ref: { streamSid: string | null }) {
    if (data.streamSid) {
      ref.streamSid = data.streamSid;
      this.logger.log(`Stream iniciado: ${ref.streamSid}`);
    }
  }

  private handlePromptEvent(data: any, ws: WebSocket) {
    const userText = data.voicePrompt;
    this.logger.log(`Fragmento usuario: "${userText}"`);

    this.userTextBuffer.push(userText);

    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      // Se procesa después del delay
      ws.emit('process');
    }, this.DEBOUNCE_DELAY_MS);
  }

  private handleInterruptEvent(ws: WebSocket) {
    this.logger.log('Usuario interrumpió al agente');

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      ws.emit('process');
    }
  }

  // ===================================================
  //  REGISTRAR WS DE TWILIO - AHORA SIMPLE
  // ===================================================

  registerTwilioWS(server: any) {
    server.on('upgrade', (req, socket, head) => {
      if (req.url?.startsWith('/ws/twilio')) {
        this.twilioWSServer.handleUpgrade(req, socket, head, (ws) =>
          this.twilioWSServer.emit('connection', ws, req),
        );
      }
    });

    this.twilioWSServer.on('connection', async (ws: WebSocket, req) => {
      this.logger.log('Twilio conectado');

      const context = {
        agentId: null as string | null,
        cardId: null as string | null,
        streamSid: null as string | null,
        conversationState: { currentNode: 'START', history: [] } as ConversationState,
        prospect: {
          contactName: 'Juan Perez',
          company: 'Empresa X',
          industry: 'Tecnología',
          contactPhone: '+573001234567',
        } as Prospect,
      };

      ws.on('process', () =>
        this.processConsolidatedPrompt(
          ws,
          context.agentId,
          context.cardId,
          context.conversationState,
          context.prospect,
        ),
      );

      ws.on('message', async (raw: string) => {
        try {
          const data = JSON.parse(raw);

          switch (data.type) {
            case 'setup':
              await this.handleSetupEvent(data, context);
              break;

            case 'start':
              this.handleStartEvent(data, context);
              break;

            case 'prompt':
              this.handlePromptEvent(data, ws);
              break;

            case 'interrupt':
              this.handleInterruptEvent(ws);
              break;
          }
        } catch (error) {
          this.logger.error('Error WS Twilio:', error);
        }
      });

      ws.on('close', () => this.logger.log('Twilio WS desconectado'));
    });
  }

  // ===================================================
  //   PROCESAR TEXTO DEL USUARIO (IGUAL QUE TU LÓGICA)
  // ===================================================

  private async processConsolidatedPrompt(
    ws: WebSocket,
    agentId: string | null,
    cardId: string | null,
    conversationState: ConversationState,
    prospect: Prospect,
  ) {
    const consolidated = this.userTextBuffer.join(' ').trim();

    this.userTextBuffer = [];
    this.debounceTimer = null;

    if (!consolidated) return;

    this.logger.log(`Procesando texto: "${consolidated}"`);

    if (!agentId) return;

    let response;
    try {
      response = await this.openaiLive.runAgent(agentId, consolidated, conversationState, prospect);
    } catch (e) {
      this.logger.error(e);
      ws.send(
        JSON.stringify({
          type: 'text',
          token: 'Lo siento, ocurrió un error.',
          last: true,
        }),
      );
      return;
    }

    if (response.shouldMoveNext && response.nextNode) {
      conversationState.currentNode = response.nextNode;
    }

    conversationState.history.push({
      node: conversationState.currentNode,
      text: response.reply,
      timestamp: new Date().toISOString(),
    });

    if (cardId) {
      await this.cardsService.updateConversationState(cardId, conversationState);

      this.server.emit('conversation:update', {
        cardId,
        conversationState,
      });
    }

    ws.send(JSON.stringify({ type: 'text', token: response.reply, last: true }));
  }

  // === MÉTODOS EXISTENTES DE SOCKET.IO ===

  private readonly activeCallsPerBoard = new Map<
    string,
    Map<string, { roomId: string; startedBy?: string }>
  >();

  private getBoardCallMap(boardId: string) {
    if (!this.activeCallsPerBoard.has(boardId)) {
      this.activeCallsPerBoard.set(boardId, new Map());
    }
    return this.activeCallsPerBoard.get(boardId)!;
  }

  private emitCallSnapshot(boardId: string, target?: Socket) {
    const calls = this.activeCallsPerBoard.get(boardId);
    const payload = calls
      ? Array.from(calls.entries()).map(([cardId, info]) => ({ cardId, ...info }))
      : [];

    (target ?? this.server.to(boardId)).emit('call:activeSet', { boardId, calls: payload });
  }

  @SubscribeMessage('joinBoard')
  handleJoinBoard(@MessageBody() boardId: string, @ConnectedSocket() client: Socket) {
    client.join(boardId);
    this.emitCallSnapshot(boardId, client);
  }

  @SubscribeMessage('call:started')
  handleCallStarted(
    @MessageBody() data: { boardId: string; cardId: string; roomId: string; user?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { boardId, cardId, roomId, user } = data;
    if (!boardId || !cardId || !roomId) return;

    this.getBoardCallMap(boardId).set(cardId, { roomId, startedBy: user });

    client.to(boardId).emit('call:started', data);
    client.emit('call:started', data);
  }

  @SubscribeMessage('call:ended')
  handleCallEnded(@MessageBody() data: { boardId: string; cardId: string; user?: string }) {
    const { boardId, cardId, user } = data;
    const boardCalls = this.activeCallsPerBoard.get(boardId);

    if (boardCalls) {
      boardCalls.delete(cardId);
      if (boardCalls.size === 0) this.activeCallsPerBoard.delete(boardId);
    }

    this.server.to(boardId).emit('call:ended', { boardId, cardId, user });
  }

  @SubscribeMessage('call:requestState')
  handleCallRequestState(
    @MessageBody() data: { boardId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.emitCallSnapshot(data.boardId, client);
  }

  @SubscribeMessage('card:dragStart')
  handleDragStart(
    @MessageBody() data: { boardId: string; cardId: string; user: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.boardId).emit('card:dragStart', {
      cardId: data.cardId,
      user: data.user,
    });
    console.log(`${data.user} empezó a arrastrar ${data.cardId}`);
  }

  @SubscribeMessage('card:dragUpdate')
  handleDragUpdate(
    @MessageBody()
    data: {
      boardId: string;
      cardId: string;
      destListId: string;
      destIndex: number;
      user: string;
      x: number;
      y: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.boardId).emit('card:dragUpdate', data);
  }

  @SubscribeMessage('card:dragEnd')
  handleDragEnd(
    @MessageBody() data: { boardId: string; cardId: string; user: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.boardId).emit('card:dragEnd', data);
    this.logger.log(`${data.user} soltó ${data.cardId}`);
  }

  emitToBoard(boardId: string, event: string, payload: any) {
    this.server.to(boardId).emit(event, payload);
  }

  emitGlobalUpdate(event: string, payload: any) {
    this.server.emit(event, payload);
  }
}
