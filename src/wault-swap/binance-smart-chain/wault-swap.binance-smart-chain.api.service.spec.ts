import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/test/test.module';
import { WaultSwapBinanceSmartChainApiService } from './wault-swap.binance-smart-chain.api.service';

describe('WaultSwapBinanceSmartChainApiService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: WaultSwapBinanceSmartChainApiService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<WaultSwapBinanceSmartChainApiService>(
      WaultSwapBinanceSmartChainApiService,
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

  describe('getFarmsByAddress', () => {
    it('pass', async () => {
      return;
    });
  });
});
