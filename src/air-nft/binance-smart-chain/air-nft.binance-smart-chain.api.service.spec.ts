import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { BigNumber } from 'ethers';
import { TestModule } from '../../extension/testing/test.module';
import { AirNFTBinanceSmartChainApiService } from './air-nft.binance-smart-chain.api.service';

describe('AirNFTBinanceSmartChainApiService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: AirNFTBinanceSmartChainApiService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<AirNFTBinanceSmartChainApiService>(
      AirNFTBinanceSmartChainApiService,
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

  describe('getNFTokensByAddress - 주소가 보유한 NFT', () => {
    it('동작 테스트', async () => {
      const nfTokens = await service.getNFTokensByAddress(
        '0xFDcBF476B286796706e273F86aC51163DA737FA8',
      );
      console.log(nfTokens);
    });
  });
});
