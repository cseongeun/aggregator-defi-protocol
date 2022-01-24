import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/test/test.module';
import { AaveAvalancheSchedulerService } from './aave.avalanche.scheduler.service';

describe('AaveAvalancheSchedulerService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: AaveAvalancheSchedulerService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<AaveAvalancheSchedulerService>(
      AaveAvalancheSchedulerService,
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

  describe('getLendingsReserveList - 대출 마켓 리저브 리스트', () => {
    it('동작 테스트', async () => {
      const reserveList = await service.getLendingReserveList();
      expect(Array.isArray(reserveList)).toBe(true);
    });
  });

  describe('getLendingMarketInfos - 대출 마켓 정보', () => {
    it('동작 테스트', async () => {
      const reserveList = await service.getLendingReserveList();

      const marketInfos = await service.getLendingMarketInfos(reserveList);

      expect(marketInfos[0]).toHaveProperty('reserve');
      expect(marketInfos[0]).toHaveProperty('aTokenAddress');
      expect(marketInfos[0]).toHaveProperty('stableDebtTokenAddress');
      expect(marketInfos[0]).toHaveProperty('variableDebtTokenAddress');
      expect(marketInfos[0]).toHaveProperty('availableLiquidity');
      expect(marketInfos[0]).toHaveProperty('totalStableDebt');
      expect(marketInfos[0]).toHaveProperty('totalVariableDebt');
      expect(marketInfos[0]).toHaveProperty('liquidityRate');
      expect(marketInfos[0]).toHaveProperty('variableBorrowRate');
      expect(marketInfos[0]).toHaveProperty('stableBorrowRate');
      expect(marketInfos[0]).toHaveProperty('averageStableBorrowRate');
      expect(marketInfos[0]).toHaveProperty('liquidityIndex');
      expect(marketInfos[0]).toHaveProperty('variableBorrowIndex');
      expect(marketInfos[0]).toHaveProperty('lastUpdateTimestamp');
      expect(marketInfos[0]).toHaveProperty('decimals');
      expect(marketInfos[0]).toHaveProperty('ltv');
      expect(marketInfos[0]).toHaveProperty('liquidationThreshold');
      expect(marketInfos[0]).toHaveProperty('liquidationBonus');
      expect(marketInfos[0]).toHaveProperty('reserveFactor');
      expect(marketInfos[0]).toHaveProperty('usageAsCollateralEnabled');
      expect(marketInfos[0]).toHaveProperty('borrowingEnabled');
      expect(marketInfos[0]).toHaveProperty('stableBorrowRateEnabled');
      expect(marketInfos[0]).toHaveProperty('isActive');
      expect(marketInfos[0]).toHaveProperty('isFrozen');
    });
  });
});
