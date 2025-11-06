// test/modules/livekit/livekit.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { LivekitController } from '../../src/livekit/livekit.controller';
import { LivekitService } from '../../src/livekit/livekit.service';

jest.mock(
  'livekit-server-sdk',
  () => ({
    AccessToken: jest.fn().mockImplementation(() => ({
      toJwt: jest.fn().mockReturnValue('mocked-jwt-token'),
    })),
  }),
  { virtual: true }
);

describe('LivekitController', () => {
  let controller: LivekitController;
  let service: LivekitService;

  beforeEach(async () => {
    const mockLivekitService = {
      generateToken: jest.fn(),
      getServerUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LivekitController],
      providers: [
        {
          provide: LivekitService,
          useValue: mockLivekitService,
        },
      ],
    }).compile();

    controller = module.get<LivekitController>(LivekitController);
    service = module.get<LivekitService>(LivekitService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('debería retornar token y url correctamente', async () => {
    const mockRoom = 'sala1';
    const mockName = 'usuarioA';
    const mockToken = 'token-123';
    const mockUrl = 'https://livekit.test.local';

    jest.spyOn(service, 'generateToken').mockResolvedValue(mockToken);
    jest.spyOn(service, 'getServerUrl').mockReturnValue(mockUrl);

    const result = await controller.getToken(mockRoom, mockName);

    expect(service.generateToken).toHaveBeenCalledWith(mockRoom, mockName);
    expect(service.getServerUrl).toHaveBeenCalled();
    expect(result).toEqual({ token: mockToken, url: mockUrl });
  });

  it('debería propagar el error si generateToken falla', async () => {
    jest.spyOn(service, 'generateToken').mockRejectedValue(new Error('Error Livekit'));
    jest.spyOn(service, 'getServerUrl').mockReturnValue('https://fake.url');

    await expect(controller.getToken('roomX', 'userY')).rejects.toThrow('Error Livekit');
  });

  it('debería registrar en consola el token generado (espía de console.log)', async () => {
    const mockToken = 'token-abc';
    const mockUrl = 'https://livekit.io';
    jest.spyOn(service, 'generateToken').mockResolvedValue(mockToken);
    jest.spyOn(service, 'getServerUrl').mockReturnValue(mockUrl);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const result = await controller.getToken('room2', 'user2');

    expect(consoleSpy).toHaveBeenCalledWith('Token generado:', mockToken);
    expect(result).toEqual({ token: mockToken, url: mockUrl });

    consoleSpy.mockRestore();
  });
});
