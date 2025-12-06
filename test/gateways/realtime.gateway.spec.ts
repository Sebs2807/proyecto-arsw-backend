import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeGateway } from '../../src/gateways/realtime.gateway';
import { Socket } from 'socket.io';
import { OpenAILiveService } from 'src/app/modules/ai/services/openAi-live.service';
import { CardService } from 'src/app/modules/cards/cards.service';

const mockOpenAILiveService = {
  // Add necessary mocked methods here if they are used in the Gateway methods being tested
};

const mockCardService = {
  // Add necessary mocked methods here if they are used in the Gateway methods being tested
};

describe('RealtimeGateway', () => {
  let gateway: RealtimeGateway;
  let mockServer: any;
  let mockClient: any;
  let mockRoomEmitter: any;

  // Creamos un mock del Logger para inyectarlo, aunque el gateway lo crea internamente,
  // el espía directo al gateway.logger suele ser más robusto si el logger es privado.
  // Sin embargo, para `handleDragStart` que usa `console.log`, necesitamos el espía global.

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

    // 2. Provide the RealtimeGateway and its dependencies (mocks)
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeGateway,
        // Mock providers to satisfy the Gateway's constructor dependencies
        {
          provide: OpenAILiveService,
          useValue: mockOpenAILiveService,
        },
        {
          provide: CardService,
          useValue: mockCardService,
        },
        // Opcional: Proporcionar un mock de Logger si fuera inyectado en el constructor
        // {
        //   provide: Logger,
        //   useValue: { log: jest.fn(), warn: jest.fn(), error: jest.fn() },
        // },
      ],
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
    // Usamos 'any' para acceder a métodos privados
    const spySnapshot = jest.spyOn<any, any>(gateway as any, 'emitCallSnapshot');

    gateway.handleCallRequestState({ boardId: 'b99' }, mockClient as Socket);

    expect(spySnapshot).toHaveBeenCalledWith('b99', mockClient);
  });

  it('should handle card:dragStart', () => {
    const data = { boardId: 'b1', cardId: 'c1', user: 'Camilo' };

    // Este espía funciona porque handleDragStart usa console.log directamente
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

    // 💡 CAMBIO CRÍTICO: Espiamos el logger de NestJS (this.logger.log), no el global (console.log).
    // Accedemos a la propiedad privada 'logger' usando 'as any'.
    const loggerSpy = jest.spyOn((gateway as any).logger, 'log').mockImplementation();

    gateway.handleDragEnd(data, mockClient as Socket);

    expect(mockClient.to).toHaveBeenCalledWith('b1');
    expect(mockRoomEmitter.emit).toHaveBeenCalledWith('card:dragEnd', data);
    expect(loggerSpy).toHaveBeenCalledWith('Ana soltó c3');

    loggerSpy.mockRestore();
  });

    it('getBoardCallMap debe crear un mapa si no existe', () => {
    const map = (gateway as any).getBoardCallMap('new-board');
    expect(map).toBeInstanceOf(Map);
    expect((gateway as any).activeCallsPerBoard.has('new-board')).toBe(true);
  });

  it('getBoardCallMap debe retornar el mismo mapa si ya existe', () => {
    const existing = new Map();
    (gateway as any).activeCallsPerBoard.set('board-x', existing);

    const res = (gateway as any).getBoardCallMap('board-x');

    expect(res).toBe(existing);
  });

  it('emitCallSnapshot debe emitir snapshot vacío cuando no hay llamadas', () => {
    const spy = jest.spyOn(mockClient, 'emit');

    (gateway as any).emitCallSnapshot('b5', mockClient);

    expect(spy).toHaveBeenCalledWith('call:activeSet', {
      boardId: 'b5',
      calls: [],
    });
  });


  it('emitCallSnapshot debe emitir snapshot con llamadas activas', () => {
    const map = new Map();
    map.set('c1', { roomId: 'r1', startedBy: 'A' });
    map.set('c2', { roomId: 'r2', startedBy: 'B' });

    (gateway as any).activeCallsPerBoard.set('b5', map);

    const spy = jest.spyOn(mockClient, 'emit');

    (gateway as any).emitCallSnapshot('b-empty', mockClient);

    expect(spy).toHaveBeenCalledWith('call:activeSet', {
      boardId: 'b-empty',
      calls: [],
    });
  });

  it('handleCallStarted no debe hacer nada si faltan parámetros', () => {
    const spyTo = jest.spyOn(mockClient, 'to');
    const spyEmit = jest.spyOn(mockRoomEmitter, 'emit');

    gateway.handleCallStarted({ boardId: null, cardId: null, roomId: null }, mockClient);

    expect(spyTo).not.toHaveBeenCalled();
    expect(spyEmit).not.toHaveBeenCalled();
  });

  it('handleCallEnded debe borrar SOLO la card y no el board si quedan más', () => {
    const map = new Map();
    map.set('c1', { roomId: 'r1' });
    map.set('c2', { roomId: 'r2' });

    (gateway as any).activeCallsPerBoard.set('b77', map);

    gateway.handleCallEnded({ boardId: 'b77', cardId: 'c1', user: 'X' });

    const after = (gateway as any).activeCallsPerBoard.get('b77');
    expect(after.size).toBe(1);
    expect(after.has('c2')).toBe(true);
  });

  it('handleJoinBoard también debe emitir snapshot inicial', () => {
    const spySnapshot = jest.spyOn<any, any>(gateway as any, 'emitCallSnapshot');

    gateway.handleJoinBoard('test-join', mockClient as Socket);

    expect(mockClient.join).toHaveBeenCalledWith('test-join');
    expect(spySnapshot).toHaveBeenCalledWith('test-join', mockClient);
  });

  it('emitToBoard debe usar sólo server.to y no server.emit', () => {
    const payload = { a: 1 };

    gateway.emitToBoard('BOARD-X', 'ev', payload);

    expect(mockServer.to).toHaveBeenCalledWith('BOARD-X');
    expect(mockServer.emit).not.toHaveBeenCalled();
  });

  it('emitGlobalUpdate debe usar sólo server.emit y no server.to', () => {
    const payload = { x: 9 };

    gateway.emitGlobalUpdate('ev2', payload);

    expect(mockServer.emit).toHaveBeenCalledWith('ev2', payload);
    expect(mockServer.to).not.toHaveBeenCalled();
  });

  it('emitCallSnapshot debe enviar snapshot usando server.to cuando no se pasa "target"', () => {
    const map = new Map();
    map.set('c1', { roomId: 'r1' });

    (gateway as any).activeCallsPerBoard.set('boardZ', map);

    const spy = jest.spyOn(mockRoomEmitter, 'emit');

    (gateway as any).emitCallSnapshot('boardZ');

    expect(mockServer.to).toHaveBeenCalledWith('boardZ');
    expect(spy).toHaveBeenCalledWith('call:activeSet', {
      boardId: 'boardZ',
      calls: [{ cardId: 'c1', roomId: 'r1' }],
    });
  });


  jest.useFakeTimers();

describe('RealtimeGateway - Twilio logic', () => {
  let gateway: RealtimeGateway;

  const mockCardsService = {
    findOne: jest.fn(),
    updateConversationState: jest.fn(),
  };

  const mockOpenAI = {
    runAgent: jest.fn(),
  };

  const mockWs: any = {
    emit: jest.fn(),
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeGateway,
        { provide: CardService, useValue: mockCardsService },
        { provide: OpenAILiveService, useValue: mockOpenAI },
      ],
    }).compile();

    gateway = module.get<RealtimeGateway>(RealtimeGateway);
    gateway.server = { emit: jest.fn(), to: jest.fn().mockReturnValue({ emit: jest.fn() }) } as any;

    mockCardsService.findOne.mockReset();
    mockOpenAI.runAgent.mockReset();
    mockWs.emit.mockReset();
    mockWs.send.mockReset();
    mockCardsService.updateConversationState.mockReset();
  });

  // -------------------------------------------------------
  // loadCardState
  // -------------------------------------------------------
  it('loadCardState — devuelve prospecto y estado por defecto', async () => {
    mockCardsService.findOne.mockResolvedValue({
      conversationState: null,
      contactName: null,
      title: null,
      industry: null,
      contactPhone: null,
    });

    const result = await (gateway as any).loadCardState('123');

    expect(result.conversationState.currentNode).toBe('START');
    expect(result.prospect.company).toBe('Empresa');
  });

  it('loadCardState — respeta datos reales', async () => {
    mockCardsService.findOne.mockResolvedValue({
      conversationState: { currentNode: 'NODE1', history: [] },
      contactName: 'Ana',
      title: 'Mi Empresa',
      industry: 'Tech',
      contactPhone: '123',
    });

    const result = await (gateway as any).loadCardState('abc');

    expect(result.conversationState.currentNode).toBe('NODE1');
    expect(result.prospect.contactName).toBe('Ana');
  });

  // -------------------------------------------------------
  // handleSetupEvent
  // -------------------------------------------------------
  it('handleSetupEvent — asigna agentId', async () => {
    const ctx = {
      agentId: null,
      cardId: null,
      conversationState: { currentNode: 'START', history: [] },
      prospect: {} as any,
    };

    await (gateway as any).handleSetupEvent(
      { customParameters: { agentId: 'AG1' } },
      ctx,
    );

    expect(ctx.agentId).toBe('AG1');
  });

  it('handleSetupEvent — asigna cardId y carga card', async () => {
    mockCardsService.findOne.mockResolvedValue({
      conversationState: { currentNode: 'X', history: [] },
      contactName: 'Luis',
      title: 'Empresa Z',
      industry: 'Ventas',
      contactPhone: '5555',
    });

    const ctx = {
      agentId: null,
      cardId: null,
      conversationState: { currentNode: 'START', history: [] },
      prospect: {} as any,
    };

    await (gateway as any).handleSetupEvent(
      { customParameters: { cardId: 'C1' } },
      ctx,
    );

    expect(ctx.cardId).toBe('C1');
    expect(ctx.conversationState.currentNode).toBe('X');
    expect(ctx.prospect.contactName).toBe('Luis');
  });

  // -------------------------------------------------------
  // handleStartEvent
  // -------------------------------------------------------
  it('handleStartEvent — configura streamSid', () => {
    const ref = { streamSid: null };
    (gateway as any).handleStartEvent({ streamSid: 'S123' }, ref);

    expect(ref.streamSid).toBe('S123');
  });

  // -------------------------------------------------------
  // handlePromptEvent
  // -------------------------------------------------------
  it('handlePromptEvent — guarda texto y programa debounce', () => {
    const data = { voicePrompt: 'Hola' };

    (gateway as any).handlePromptEvent(data, mockWs);

    expect(gateway['userTextBuffer']).toContain('Hola');

    jest.advanceTimersByTime(500);
    expect(mockWs.emit).toHaveBeenCalledWith('process');
  });

  // -------------------------------------------------------
  // handleInterruptEvent
  // -------------------------------------------------------
  it('handleInterruptEvent — ejecuta process si hay timer', () => {
    gateway['debounceTimer'] = setTimeout(() => {}, 500);

    (gateway as any).handleInterruptEvent(mockWs);

    expect(mockWs.emit).toHaveBeenCalledWith('process');
  });

  // -------------------------------------------------------
  // processConsolidatedPrompt
  // -------------------------------------------------------
  it('processConsolidatedPrompt — no procesa si texto vacío', async () => {
    gateway['userTextBuffer'] = [];

    await (gateway as any).processConsolidatedPrompt(
      mockWs, 'A1', 'C1',
      { currentNode: 'N', history: [] },
      {},
    );

    expect(mockOpenAI.runAgent).not.toHaveBeenCalled();
  });

  it('processConsolidatedPrompt — llama a openAI y envía respuesta', async () => {
    gateway['userTextBuffer'] = ['Hola', 'mundo'];

    mockOpenAI.runAgent.mockResolvedValue({
      reply: 'respuesta!',
      shouldMoveNext: false,
    });

    await (gateway as any).processConsolidatedPrompt(
      mockWs, 'AGENT', 'CARD',
      { currentNode: 'X', history: [] },
      {},
    );

    expect(mockOpenAI.runAgent).toHaveBeenCalled();
    expect(mockWs.send).toHaveBeenCalled();
  });

  it('processConsolidatedPrompt — actualiza estado si cardId existe', async () => {
    gateway['userTextBuffer'] = ['Hola'];
    mockOpenAI.runAgent.mockResolvedValue({
      reply: 'ok',
      shouldMoveNext: false,
    });

    await (gateway as any).processConsolidatedPrompt(
      mockWs, 'AG', 'C1',
      { currentNode: 'A', history: [] },
      {},
    );

    expect(mockCardsService.updateConversationState).toHaveBeenCalled();
    expect(gateway.server.emit).toHaveBeenCalled();
  });

  it('processConsolidatedPrompt — maneja error de openAI', async () => {
    gateway['userTextBuffer'] = ['Texto'];
    mockOpenAI.runAgent.mockRejectedValue(new Error('AI fail'));

    await (gateway as any).processConsolidatedPrompt(
      mockWs, 'AG', 'C1',
      { currentNode: 'A', history: [] },
      {},
    );

    expect(mockWs.send).toHaveBeenCalled();
  });
});
});
