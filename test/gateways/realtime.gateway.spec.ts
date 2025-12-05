// test/gateways/realtime.gateway.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeGateway } from '../../src/gateways/realtime.gateway';
import { Server, Socket } from 'socket.io';

describe('RealtimeGateway', () => {
  let gateway: RealtimeGateway;
  let mockServer: any;
  let mockClient: any;
  let mockRoomEmitter: any;

  beforeEach(async () => {
    mockRoomEmitter = {
      emit: jest.fn(),
    };

    mockServer = {
      to: jest.fn().mockReturnValue(mockRoomEmitter),
      emit: jest.fn(),
    };

    mockClient = {
      id: 'client123',
      join: jest.fn(),
      to: jest.fn().mockReturnValue(mockRoomEmitter),
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RealtimeGateway],
    }).compile();

    gateway = module.get<RealtimeGateway>(RealtimeGateway);
    (gateway as any).server = mockServer;
  });

  it('debería unirse a un tablero', () => {
    const boardId = 'board-1';

    gateway.handleJoinBoard(boardId, mockClient as Socket);

    expect(mockClient.join).toHaveBeenCalledWith(boardId);
  });

  it('emitToBoard debería emitir a la sala correcta', () => {
    const payload = { msg: 'hola' };

    gateway.emitToBoard('board-123', 'test:event', payload);

    expect(mockServer.to).toHaveBeenCalledWith('board-123');
    expect(mockRoomEmitter.emit).toHaveBeenCalledWith('test:event', payload);
  });

  it('emitGlobalUpdate debería emitir globalmente', () => {
    const payload = { msg: 'global' };

    gateway.emitGlobalUpdate('update:event', payload);

    expect(mockServer.emit).toHaveBeenCalledWith('update:event', payload);
  });

  it('call:started debería guardar el estado y emitir en la sala', () => {
    const data = {
      boardId: 'b1',
      cardId: 'c1',
      roomId: 'r1',
      user: 'Camilo',
    };

    gateway.handleCallStarted(data, mockClient as Socket);

    const boardMap = (gateway as any).activeCallsPerBoard.get('b1');

    expect(boardMap.get('c1')).toEqual({
      roomId: 'r1',
      startedBy: 'Camilo',
    });

    expect(mockClient.to).toHaveBeenCalledWith('b1');
    expect(mockRoomEmitter.emit).toHaveBeenCalledWith('call:started', data);
  });

  it('call:ended debería eliminar el estado y emitir', () => {
    (gateway as any).activeCallsPerBoard.set('b1', new Map([['c1', { roomId: 'r1' }]]));

    gateway.handleCallEnded({ boardId: 'b1', cardId: 'c1', user: 'Pedro' });

    const map = (gateway as any).activeCallsPerBoard.get('b1');
    expect(map).toBeUndefined(); 

    expect(mockServer.to).toHaveBeenCalledWith('b1');
    expect(mockRoomEmitter.emit).toHaveBeenCalledWith('call:ended', {
      boardId: 'b1',
      cardId: 'c1',
      user: 'Pedro',
    });
  });

  it('call:requestState debería enviar snapshot al cliente', () => {
    const spySnapshot = jest.spyOn<any, any>(gateway as any, 'emitCallSnapshot');

    gateway.handleCallRequestState({ boardId: 'b99' }, mockClient as Socket);

    expect(spySnapshot).toHaveBeenCalledWith('b99', mockClient);
  });

  it('should handle card:dragStart', () => {
    const data = { boardId: 'b1', cardId: 'c1', user: 'Camilo' };
    const spy = jest.spyOn(console, 'log').mockImplementation();

    gateway.handleDragStart(data, mockClient as Socket);

    expect(mockClient.to).toHaveBeenCalledWith('b1');
    expect(mockRoomEmitter.emit).toHaveBeenCalledWith('card:dragStart', {
      cardId: 'c1',
      user: 'Camilo',
    });
    expect(spy).toHaveBeenCalledWith('Camilo empezó a arrastrar c1');

    spy.mockRestore();
  });

  it('should handle card:dragUpdate', () => {
    const data = {
      boardId: 'b1',
      cardId: 'c2',
      destListId: 'list1',
      destIndex: 2,
      user: 'Carlos',
      x: 120,
      y: 300,
    };

    gateway.handleDragUpdate(data, mockClient as Socket);

    expect(mockClient.to).toHaveBeenCalledWith('b1');
    expect(mockRoomEmitter.emit).toHaveBeenCalledWith('card:dragUpdate', data);
  });

  it('should handle card:dragEnd', () => {
    const data = { boardId: 'b1', cardId: 'c3', user: 'Ana' };
    const spy = jest.spyOn(console, 'log').mockImplementation();

    gateway.handleDragEnd(data, mockClient as Socket);

    expect(mockClient.to).toHaveBeenCalledWith('b1');
    expect(mockRoomEmitter.emit).toHaveBeenCalledWith('card:dragEnd', data);
    expect(spy).toHaveBeenCalledWith('Ana soltó c3');

    spy.mockRestore();
  });
});
