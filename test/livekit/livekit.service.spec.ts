// Mock virtual del módulo externo que no existe físicamente
jest.mock(
  'livekit-server-sdk',
  () => {
    const mockAddGrant = jest.fn();
    const mockToJwt = jest.fn(async () => 'mocked-jwt-token');

    const AccessToken = jest.fn().mockImplementation((apiKey, apiSecret, options) => {
      return {
        apiKey,
        apiSecret,
        options,
        addGrant: mockAddGrant,
        toJwt: mockToJwt,
      };
    });

    return { AccessToken };
  },
  { virtual: true },
);

import { LivekitService } from '../../src/livekit/livekit.service';
import { AccessToken } from 'livekit-server-sdk';

describe('LivekitService', () => {
  let service: LivekitService;
  const OLD_ENV = process.env;

  beforeAll(() => {
    jest.spyOn(global.console, 'error').mockImplementation(() => {});
    jest.spyOn(global.console, 'log').mockImplementation(() => {});
    jest.spyOn(global.console, 'warn').mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...OLD_ENV,
      LIVEKIT_API_KEY: 'test-key',
      LIVEKIT_API_SECRET: 'test-secret',
      LIVEKIT_URL: 'https://livekit.example.com',
    };
    service = new LivekitService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('debería generar un token JWT válido', async () => {
    const token = await service.generateToken('test-room', 'test-user');
    expect(token).toBe('mocked-jwt-token');
  });

  it('debería llamar a AccessToken con las credenciales correctas', async () => {
    await service.generateToken('test-room', 'test-user');

    expect(AccessToken).toHaveBeenCalledTimes(1);
    expect(AccessToken).toHaveBeenCalledWith('test-key', 'test-secret', {
      identity: 'test-user',
      name: 'test-user',
    });

    const instance = (AccessToken as jest.Mock).mock.results[0].value;
    expect(instance.addGrant).toHaveBeenCalledWith({
      roomJoin: true,
      room: 'test-room',
      canPublish: true,
      canSubscribe: true,
    });
  });

  it('debería retornar la URL del servidor LiveKit', () => {
    const url = service.getServerUrl();
    expect(url).toBe('https://livekit.example.com');
  });

  it('debería lanzar error si falla la generación del token', async () => {
    (AccessToken as jest.Mock).mockImplementationOnce(() => ({
      addGrant: jest.fn(),
      toJwt: jest.fn().mockRejectedValue(new Error('fallo interno')),
    }));

    const brokenService = new LivekitService();
    await expect(brokenService.generateToken('room', 'user')).rejects.toThrow('fallo interno');
  });

  it('debería usar displayName cuando se proporciona', async () => {
    await service.generateToken('sala-demo', 'user-123', 'Usuario Demo');

    expect(AccessToken).toHaveBeenCalledWith('test-key', 'test-secret', {
      identity: 'user-123',
      name: 'Usuario Demo',
    });
  });
});
