import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/test/test.module';
import { SushiSwapFantomApiService } from './sushi-swap.fantom.api.service';

describe('SushiSwapFantomApiService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: SushiSwapFantomApiService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<SushiSwapFantomApiService>(
      SushiSwapFantomApiService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Base. Accessor', () => {
    it('provider', async () => {
      expect(service.provider).toBeInstanceOf(Provider);
    });
  });
});
