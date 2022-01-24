import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/test/test.module';
import { BiSwapBinanceSmartChainApiService } from './bi-swap.binance-smart-chain.api.service';

describe('BiSwapBinanceSmartChainApiService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: BiSwapBinanceSmartChainApiService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<BiSwapBinanceSmartChainApiService>(
      BiSwapBinanceSmartChainApiService,
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
    it('pass', () => {
      return;
    });
  });
});
