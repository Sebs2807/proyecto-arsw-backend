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

  @SubscribeMessage('joinBoard')
  handleJoinBoard(@MessageBody() boardId: string, @ConnectedSocket() client: Socket) {
    client.join(boardId);
    console.log(`🔗 Cliente ${client.id} unido al tablero ${boardId}`);
  }

  emitToBoard(boardId: string, event: string, payload: any) {
    this.server.to(boardId).emit(event, payload);
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
}
