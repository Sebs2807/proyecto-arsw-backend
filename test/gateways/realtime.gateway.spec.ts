import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeGateway } from '../../src/gateways/realtime.gateway';
import { Server, Socket } from 'socket.io';

describe('RealtimeGateway', () => {
  let gateway: RealtimeGateway;
  let mockServer: Partial<Server>;
  let mockClient: Partial<Socket>;
  let mockRoomEmitter: any;

  beforeEach(async () => {
    mockRoomEmitter = {
      emit: jest.fn(),
    };

    mockServer = {
      to: jest.fn().mockReturnThis(),
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
    // @ts-ignore
    gateway.server = mockServer as Server;
  });

  it('debería unirse a un tablero', () => {
    const boardId = 'board-1';
    gateway.handleJoinBoard(boardId, mockClient as Socket);

    expect(mockClient.join).toHaveBeenCalledWith(boardId);
  });

  it('debería emitir un evento a un tablero', () => {
    const boardId = 'board-123';
    const payload = { msg: 'hola' };
    gateway.emitToBoard(boardId, 'test:event', payload);

    expect(mockServer.to).toHaveBeenCalledWith(boardId);
    expect(mockServer.emit).toHaveBeenCalledWith('test:event', payload);
  });

  it('debería emitir un evento global', () => {
    const payload = { msg: 'global update' };
    gateway.emitGlobalUpdate('update', payload);

    expect(mockServer.emit).toHaveBeenCalledWith('update', payload);
  });

  it('debería manejar card:dragStart', () => {
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

  it('debería manejar card:dragUpdate', () => {
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

  it('debería manejar card:dragEnd', () => {
    const data = { boardId: 'b1', cardId: 'c3', user: 'Ana' };
    const spy = jest.spyOn(console, 'log').mockImplementation();

    gateway.handleDragEnd(data, mockClient as Socket);

    expect(mockClient.to).toHaveBeenCalledWith('b1');
    expect(mockRoomEmitter.emit).toHaveBeenCalledWith('card:dragEnd', data);
    expect(spy).toHaveBeenCalledWith('Ana soltó c3');

    spy.mockRestore();
  });
});
