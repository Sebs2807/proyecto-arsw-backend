import { Test, TestingModule } from '@nestjs/testing';
import { LiveKitController } from 'src/app/modules/livekit/livekit.controller';
import { AccessToken } from 'livekit-server-sdk';

jest.mock('livekit-server-sdk', () => {
  return {
    AccessToken: jest.fn().mockImplementation(() => ({
      addGrant: jest.fn(),
      toJwt: jest.fn().mockReturnValue('mock-jwt-token'),
    })),
  };
});

describe('LiveKitController', () => {
  let controller: LiveKitController;

  beforeEach(async () => {
    process.env.LIVEKIT_API_KEY = 'test-api-key';
    process.env.LIVEKIT_API_SECRET = 'test-api-secret';

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiveKitController],
    }).compile();

    controller = module.get<LiveKitController>(LiveKitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a token', () => {
    const result = controller.getToken('test-room', 'john');

    expect(result).toEqual({ token: 'mock-jwt-token' });

    expect(AccessToken).toHaveBeenCalledWith(
      'test-api-key',
      'test-api-secret',
      { identity: 'john' },
    );

    const instance = (AccessToken as jest.Mock).mock.results[0].value;
    expect(instance.addGrant).toHaveBeenCalledWith({
      room: 'test-room',
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });
  });

  it('should work even if room or name are missing', () => {
    const result = controller.getToken('', '');

    expect(result).toEqual({ token: 'mock-jwt-token' });
  });
});
