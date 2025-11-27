import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../src/app/app.controller';
import { AppService } from '../src/app/app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });

    it('should inject AppService correctly in the constructor', () => {
      const controller = new AppController(appService);
      expect(controller).toBeDefined();
      expect((controller as any).appService).toBe(appService);
    });
  });
});
