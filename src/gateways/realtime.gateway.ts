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

// Definición de tipos para mejorar la claridad
interface ConversationState {
  currentNode: string;
  history: Array<{
    node: string;
    text: string;
    timestamp: string;
  }>;
}

interface Prospect {
  contactName: string;
  company: string;
  industry: string;
  contactPhone: string;
}

// ----------------------------------------------------

@WebSocketGateway({
  cors: { origin: '*' },
})
@Injectable()
export class RealtimeGateway {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server: IOServer;

  private readonly twilioWSServer: WebSocket.Server;

  // === ESTADO DE DEBOUNCING ===
  private debounceTimer: NodeJS.Timeout | null = null;
  private userTextBuffer: string[] = [];
  private readonly DEBOUNCE_DELAY_MS = 500; // 500ms de pausa para consolidar fragmentos
  // =============================

  constructor(
    private readonly openaiLive: OpenAILiveService,
    @Inject(forwardRef(() => CardService))
    private readonly cardsService: CardService,
  ) {
    this.twilioWSServer = new WebSocket.Server({ noServer: true });
  }

  /**
   * ================= TWILIO MEDIA STREAMS ===================
   * Endpoint: ws://server/ws/twilio?agentId=XYZ
   */
  registerTwilioWS(server: any) {
    server.on('upgrade', (req, socket, head) => {
      if (req.url?.startsWith('/ws/twilio')) {
        this.twilioWSServer.handleUpgrade(req, socket, head, (ws) => {
          this.twilioWSServer.emit('connection', ws, req);
        });
      }
    });

    this.twilioWSServer.on('connection', async (ws: WebSocket, req) => {
      console.log(`Twilio ConversationRelay conectado`);

      let agentId: string | null = null;
      let cardId: string | null = null;
      let streamSid: string | null = null;
      let conversationState: ConversationState = { currentNode: 'START', history: [] };
      let prospect: Prospect = {
        contactName: 'Juan Perez',
        company: 'Empresa X',
        industry: 'Tecnología',
        contactPhone: '+573001234567',
      };

      ws.on('message', async (msg: string) => {
        try {
          const data = JSON.parse(msg);
          console.log('Twilio Event:', JSON.stringify(data, null, 2));

          switch (data.type) {
            case 'setup':
              console.log('Setup Event:', data);
              if (data.customParameters?.agentId) {
                agentId = data.customParameters.agentId;
                console.log(`AgentId configurado desde setup: ${agentId}`);
              }
              if (data.customParameters?.cardId) {
                cardId = data.customParameters.cardId;
                console.log(`CardId configurado desde setup: ${cardId}`);

                // Cargar el estado de conversación y prospecto
                try {
                  if (cardId) {
                    const card = await this.cardsService.findOne(cardId);

                    if (card.conversationState) {
                      conversationState = card.conversationState as ConversationState;
                      console.log(
                        `📂 Estado de conversación cargado: ${conversationState.currentNode}`,
                      );
                    }

                    prospect = {
                      contactName: card.contactName || 'Prospecto',
                      company: card.title || 'Empresa',
                      industry: card.industry || 'No especificada',
                      contactPhone: card.contactPhone || 'No especificado',
                    };
                    console.log(`Prospecto cargado: ${prospect.contactName}`);
                  }
                } catch (err) {
                  console.error('Error cargando card:', err);
                }
              }
              break;

            case 'start':
              if (data.streamSid) streamSid = data.streamSid;
              console.log(`Stream iniciado: ${streamSid}`);
              break;

            case 'prompt': {
              // === LÓGICA DE DEBOUNCING APLICADA ===
              const userText = data.voicePrompt;
              console.log(`Fragmento de Usuario: "${userText}"`);

              this.userTextBuffer.push(userText); // Agregar al buffer

              if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
              }

              // Iniciar el temporizador de debouncing
              this.debounceTimer = setTimeout(() => {
                this.processConsolidatedPrompt(ws, agentId, cardId, conversationState, prospect);
              }, this.DEBOUNCE_DELAY_MS);
              // ======================================
              break;
            }

            case 'interrupt':
              console.log('Usuario interrumpió al agente');
              // Si hay interrupción, procesamos inmediatamente lo que esté en el buffer
              if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
                this.processConsolidatedPrompt(ws, agentId, cardId, conversationState, prospect);
              }
              break;

            default:
              // console.log('Evento no manejado:', data.type);
              break;
          }
        } catch (err) {
          console.error('Error WS Twilio:', err);
        }
      });

      ws.on('close', () => {
        console.log('Twilio WS desconectado');
      });
    });
  }

  /**
   * Procesa el texto consolidado del usuario después de que el debouncing expira.
   */
  private async processConsolidatedPrompt(
    ws: WebSocket,
    agentId: string | null,
    cardId: string | null,
    conversationState: ConversationState,
    prospect: Prospect,
  ) {
    // 1. Consolidar y limpiar el buffer
    const consolidatedUserText = this.userTextBuffer.join(' ').trim();
    this.userTextBuffer = [];
    this.debounceTimer = null; // Resetear temporizador

    if (!consolidatedUserText) return;

    console.log(`Procesando texto consolidado: "${consolidatedUserText}"`);

    // Verificaciones de estado
    if (!agentId) {
      this.logger.warn('No agentId received yet - cannot run AI');
      return;
    }

    if (!cardId) {
      this.logger.warn('No cardId received - conversation state will not be persisted');
    }

    // Llamar a la IA
    let agentResponse: { reply: string; shouldMoveNext: boolean; nextNode: string };
    try {
      agentResponse = await this.openaiLive.runAgent(
        agentId,
        consolidatedUserText, // Usamos el texto consolidado
        conversationState,
        prospect,
      );
    } catch (error) {
      this.logger.error('Error llamando a la IA:', error);
      const errorMessage = {
        type: 'text',
        token:
          'Lo siento, estoy teniendo problemas técnicos. Por favor, intenta de nuevo en un momento.',
        last: true,
      };
      ws.send(JSON.stringify(errorMessage));
      return;
    }

    console.log('Respuesta IA (RAW):', agentResponse.reply);

    // Limpiar el texto de la IA
    const safeReply = agentResponse.reply.replace(/[\u0000-\u001f]/g, '').trim();

    console.log('Respuesta IA (CLEAN):', safeReply);

    // Actualizar estado en memoria
    if (agentResponse.shouldMoveNext && agentResponse.nextNode) {
      conversationState.currentNode = agentResponse.nextNode;
    }

    // Agregar al historial (usando la respuesta limpia)
    conversationState.history = [
      ...(conversationState.history || []),
      {
        node: conversationState.currentNode,
        text: safeReply,
        timestamp: new Date().toISOString(),
      },
    ];

    // Persistir el estado actualizado en la base de datos
    if (cardId) {
      try {
        await this.cardsService.updateConversationState(cardId, conversationState);
        console.log(`Estado persistido en DB para card ${cardId}`);

        // Emitir actualización en tiempo real
        this.server.emit('conversation:update', {
          cardId,
          conversationState,
        });
      } catch (err) {
        this.logger.error('Error persistiendo estado:', err);
      }
    }

    // Enviar respuesta de texto a Twilio para que ElevenLabs la hable
    const replyMessage = {
      type: 'text',
      token: safeReply,
      last: true,
    };

    ws.send(JSON.stringify(replyMessage));
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
