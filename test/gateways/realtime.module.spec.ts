import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeModule } from '../../src/gateways/realtime.module';
import { RealtimeGateway } from '../../src/gateways/realtime.gateway';

describe('RealtimeModule', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [RealtimeModule],
    }).compile();
  });

  it('debería compilar correctamente el módulo', async () => {
    const module = moduleRef.get<RealtimeModule>(RealtimeModule);
    expect(module).toBeDefined();
  });

  it('debería proveer el RealtimeGateway', async () => {
    const gateway = moduleRef.get<RealtimeGateway>(RealtimeGateway);
    expect(gateway).toBeInstanceOf(RealtimeGateway);
  });

  it('debería exportar el RealtimeGateway', async () => {
    const testModule = await Test.createTestingModule({
      imports: [RealtimeModule],
    }).compile();

    const exportedGateway = testModule.get(RealtimeGateway);
    expect(exportedGateway).toBeDefined();
    expect(exportedGateway).toBeInstanceOf(RealtimeGateway);
  });
});
