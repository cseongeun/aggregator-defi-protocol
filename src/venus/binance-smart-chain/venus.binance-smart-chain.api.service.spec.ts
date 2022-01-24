import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/test/test.module';
import { VenusBinanceSmartChainApiService } from './venus.binance-smart-chain.api.service';

describe('VenusBinanceSmartChainApiService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: VenusBinanceSmartChainApiService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<VenusBinanceSmartChainApiService>(
      VenusBinanceSmartChainApiService,
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

  describe('getLendingsByAddress', () => {
    it('pass', async () => {
      return;
    });
  });
});
