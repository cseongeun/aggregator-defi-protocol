import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { FarmService } from '@seongeun/aggregator-base/lib/service';
import { TestModule } from '../../extension/test/test.module';
import { ApeSwapBinanceSmartChainApiService } from './ape-swap.binance-smart-chain.api.service';

describe('ApeSwapBinanceSmartChainApiService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: ApeSwapBinanceSmartChainApiService;
  let farmService: FarmService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<ApeSwapBinanceSmartChainApiService>(
      ApeSwapBinanceSmartChainApiService,
    );
    farmService = await app.get<FarmService>(FarmService);
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
    it('동작 테스트', async () => {
      const address = '0xFDcBF476B286796706e273F86aC51163DA737FA8';
      const farms = await farmService.repository.findAllBy({
        protocol: service.protocol,
        status: true,
      });

      const result = await service.getFarmsByAddress(address, farms);
      console.log(JSON.stringify(result));
    });
  });

  describe('getNFTokensByAddress', () => {
    it('pass', () => {
      return;
    });
  });
});
