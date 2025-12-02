import {
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server as IOServer, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import * as WebSocket from 'ws';
import { OpenAILiveService } from 'src/app/modules/ai/services/openAi-live.service';
import { last } from 'rxjs';

@WebSocketGateway({
  cors: { origin: '*' },
})
@Injectable()
export class RealtimeGateway {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server: IOServer;

  private twilioWSServer: WebSocket.Server;

  constructor(private readonly openaiLive: OpenAILiveService) {
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
      console.log(`📞 Twilio ConversationRelay conectado`);

      let agentId: string | null = null;
      let streamSid: string | null = null;
      let conversationState = { currentNode: 'START' };
      const prospect = {
        contactName: 'Juan Perez',
        company: 'Empresa X',
        industry: 'Tecnología',
        contactPhone: '+573001234567',
      };

      ws.on('message', async (msg: string) => {
        try {
          const data = JSON.parse(msg);
          console.log('📩 Twilio Event:', JSON.stringify(data, null, 2));

          switch (data.type) {
            case 'setup':
              console.log('⚙️ Setup Event:', data);
              if (data.customParameters?.agentId) {
                agentId = data.customParameters.agentId;
                console.log(`✅ AgentId configurado desde setup: ${agentId}`);
              }
              break;

            case 'start':
              // En ConversationRelay, start puede no traer customParameters si ya vinieron en setup
              if (data.streamSid) streamSid = data.streamSid;
              console.log(`🚀 Stream iniciado: ${streamSid}`);
              break;

            case 'prompt':
              // El usuario habló y Twilio ya lo transcribió
              const userText = data.voicePrompt;
              console.log(`🗣️ Usuario dijo: "${userText}"`);

              if (!agentId) {
                console.warn('⚠️ No agentId received yet');
                return;
              }

              // Llamar a la IA
              const agentResponse = await this.openaiLive.runAgent(
                agentId,
                userText,
                conversationState,
                prospect,
              );

              console.log('🤖 Respuesta IA (RAW):', agentResponse.reply);

              // ----------------------------------------------------
              // APLICACIÓN DE LA SOLUCIÓN: LIMPIAR EL TEXTO DE LA IA
              // ----------------------------------------------------
              const safeReply = agentResponse.reply
                // Remueve caracteres de control (0x00 a 0x1F) que suelen causar fallos de parsing.
                .replace(/[\u0000-\u001f]/g, '')
                // Asegura la codificación UTF-8 si es necesario (aunque JSON.stringify lo hace)
                // Usaremos .trim() para eliminar espacios innecesarios
                .trim();

              console.log('✅ Respuesta IA (CLEAN):', safeReply);
              // ----------------------------------------------------

              // Actualizar estado
              if (agentResponse.shouldMoveNext && agentResponse.nextNode) {
                conversationState.currentNode = agentResponse.nextNode;
              }

              // Enviar respuesta de texto a Twilio para que ElevenLabs la hable
              const replyMessage = {
                type: 'text',
                token: safeReply, // Usamos 'text' en lugar de 'body'
                last: true,
              };

              ws.send(JSON.stringify(replyMessage));
              break;

            case 'interrupt':
              console.log('🛑 Usuario interrumpió al agente');
              // Aquí podrías limpiar el estado o cancelar generaciones pendientes
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

  @SubscribeMessage('joinBoard')
  handleJoinBoard(@MessageBody() boardId: string, @ConnectedSocket() client: Socket) {
    client.join(boardId);
    console.log(`🔗 Cliente ${client.id} unido al tablero ${boardId}`);
  }

  emitToBoard(boardId: string, event: string, payload: any) {
    this.server.to(boardId).emit(event, payload);
  }

  // Emit to all connected clients (global)
  emitGlobalUpdate(event: string, payload: any) {
    this.server.emit(event, payload);
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
}
