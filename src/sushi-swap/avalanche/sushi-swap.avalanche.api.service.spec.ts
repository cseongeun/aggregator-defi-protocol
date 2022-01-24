import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/test/test.module';
import { SushiSwapAvalancheApiService } from './sushi-swap.avalanche.api.service';

describe('SushiSwapAvalancheApiService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: SushiSwapAvalancheApiService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<SushiSwapAvalancheApiService>(
      SushiSwapAvalancheApiService,
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
