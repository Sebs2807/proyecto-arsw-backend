// test/modules/livekit/livekit.module.spec.ts
jest.mock('livekit-server-sdk', () => ({
  AccessToken: jest.fn().mockImplementation(() => ({
    addGrant: jest.fn(),
    toJwt: jest.fn().mockResolvedValue('mocked-jwt-token'),
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { LivekitModule } from '../../src/livekit/livekit.module';
import { LivekitService } from '../../src/livekit/livekit.service';
import { LivekitController } from '../../src/livekit/livekit.controller';

describe('LivekitModule', () => {
  let controller: LivekitController;
  let service: LivekitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LivekitModule],
    }).compile();

    controller = module.get<LivekitController>(LivekitController);
    service = module.get<LivekitService>(LivekitService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should generate token and return URL', async () => {
    jest.spyOn(service, 'generateToken').mockResolvedValue('mocked-jwt-token');
    jest.spyOn(service, 'getServerUrl').mockReturnValue('https://mocked-url.com');

    const result = await controller.getToken('test-room', 'test-user');
    expect(result).toEqual({
      token: 'mocked-jwt-token',
      url: 'https://mocked-url.com',
    });
  });
});
