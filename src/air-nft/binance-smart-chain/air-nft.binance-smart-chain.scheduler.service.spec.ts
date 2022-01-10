import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/testing/test.module';
import { AirNFTBinanceSmartChainSchedulerService } from './air-nft.binance-smart-chain.scheduler.service';

describe('AirNFTBinanceSmartChainSchedulerService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: AirNFTBinanceSmartChainSchedulerService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<AirNFTBinanceSmartChainSchedulerService>(
      AirNFTBinanceSmartChainSchedulerService,
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

  describe('getNFTokenTotalSupply - NFT 총 발행량', () => {
    it('동작 테스트', async () => {
      const totalSupply = await service.getNFTokenTotalSupply();
      expect(totalSupply.toNumber()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getNFTokenInfos -  NFT 정보', () => {
    it('동작 테스트', async () => {
      const nfTokenInfos = await service.getNFTokenInfos([0]);

      expect(nfTokenInfos[0]).toHaveProperty('id');
      expect(nfTokenInfos[0]).toHaveProperty('owner');
      expect(nfTokenInfos[0]).toHaveProperty('tokenURI');
    });
  });
});
