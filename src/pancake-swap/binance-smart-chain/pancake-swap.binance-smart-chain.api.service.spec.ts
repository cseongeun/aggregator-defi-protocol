import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/test/test.module';
import { PancakeSwapBinanceSmartChainApiService } from './pancake-swap.binance-smart-chain.api.service';

describe('PancakeSwapBinanceSmartChainApiService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: PancakeSwapBinanceSmartChainApiService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<PancakeSwapBinanceSmartChainApiService>(
      PancakeSwapBinanceSmartChainApiService,
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

  describe('getNFTokensByAddress', () => {
    it('pass', () => {
      return;
    });
  });
});
