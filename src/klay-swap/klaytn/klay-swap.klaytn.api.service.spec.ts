import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/test/test.module';
import { KlaySwapKlaytnApiService } from './klay-swap.klaytn.api.service';

describe('KlaySwapKlaytnApiService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: KlaySwapKlaytnApiService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<KlaySwapKlaytnApiService>(KlaySwapKlaytnApiService);
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
