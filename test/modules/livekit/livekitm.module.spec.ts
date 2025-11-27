import { Test, TestingModule } from '@nestjs/testing';
import { LiveKitModule } from 'src/app/modules/livekit/livekit.module';
import { LiveKitController } from 'src/app/modules/livekit/livekit.controller';

jest.mock('livekit-server-sdk', () => ({
  AccessToken: jest.fn().mockImplementation(() => ({
    addGrant: jest.fn(),
    toJwt: jest.fn().mockReturnValue('mock-jwt-token'),
  })),
}));

describe('LiveKitModule', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [LiveKitModule],
    }).compile();
  });

  it('should be defined', () => {
    const module = moduleRef.get<LiveKitModule>(LiveKitModule);
    expect(module).toBeDefined();
  });

  it('should load the LiveKitController', () => {
    const controller = moduleRef.get<LiveKitController>(LiveKitController);
    expect(controller).toBeDefined();
  });
});
