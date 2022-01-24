import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/test/test.module';
import { MdexBinanceSmartChainApiService } from './mdex.binance-smart-chain.api.service';

describe('MdexBinanceSmartChainApiService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: MdexBinanceSmartChainApiService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<MdexBinanceSmartChainApiService>(
      MdexBinanceSmartChainApiService,
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
