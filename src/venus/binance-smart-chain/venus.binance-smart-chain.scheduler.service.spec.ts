import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/testing/test.module';
import { VenusBinanceSmartChainSchedulerService } from './venus.binance-smart-chain.scheduler.service';

describe('VenusBinanceSmartChainSchedulerService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: VenusBinanceSmartChainSchedulerService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<VenusBinanceSmartChainSchedulerService>(
      VenusBinanceSmartChainSchedulerService,
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

  describe('lending', () => {
    describe('getLendingAllMarkets', () => {
      it('동작 테스트', async () => {
        const totalMarkets = await service.getLendingAllMarkets();
        expect(Array.isArray(totalMarkets)).toBe(true);
      });
    });

    describe('getLendingMarketInfos', () => {
      it('동작 테스트', async () => {
        const totalMarkets = await service.getLendingAllMarkets();
        const marketInfos = await service.getLendingMarketInfos(
          totalMarkets[0],
        );
        expect(marketInfos).toHaveProperty('underlying');
        expect(marketInfos).toHaveProperty('supplyRatePerBlock');
        expect(marketInfos).toHaveProperty('borrowRatePerBlock');
        expect(marketInfos).toHaveProperty('decimals');
        expect(marketInfos).toHaveProperty('totalBorrows');
        expect(marketInfos).toHaveProperty('totalReserves');
        expect(marketInfos).toHaveProperty('reserveFactorMantissa');
        expect(marketInfos).toHaveProperty('market');
        expect(marketInfos).toHaveProperty('market.isListed');
        expect(marketInfos).toHaveProperty('market.collateralFactorMantissa');
        expect(marketInfos).toHaveProperty('market.isVenus');
      });
    });
  });
});
