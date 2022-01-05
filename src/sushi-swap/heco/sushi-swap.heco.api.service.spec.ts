import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/testing/test.module';
import { SushiSwapHecoApiService } from './sushi-swap.heco.api.service';

describe('SushiSwapHecoApiService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: SushiSwapHecoApiService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<SushiSwapHecoApiService>(SushiSwapHecoApiService);
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
