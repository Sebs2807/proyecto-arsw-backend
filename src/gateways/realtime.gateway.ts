import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class RealtimeGateway {
  @WebSocketServer()
  server: Server;

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
    console.log(`${data.user} soltó ${data.cardId}`);
  }

  emitToBoard(boardId: string, event: string, payload: any) {
    this.server.to(boardId).emit(event, payload);
  }

  emitGlobalUpdate(event: string, payload: any) {
    this.server.emit(event, payload);
  }
}
