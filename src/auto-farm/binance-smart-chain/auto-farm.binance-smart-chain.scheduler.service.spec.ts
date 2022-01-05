import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/testing/test.module';
import { AutoFarmBinanceSmartChainSchedulerService } from './auto-farm.binance-smart-chain.scheduler.service';

describe('AutoFarmBinanceSmartChainSchedulerService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: AutoFarmBinanceSmartChainSchedulerService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<AutoFarmBinanceSmartChainSchedulerService>(
      AutoFarmBinanceSmartChainSchedulerService,
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

  describe('getFarmTotalLength - 팜 총 갯수', () => {
    it('동작 테스트', async () => {
      const totalLength = await service.getFarmTotalLength();
      expect(totalLength.toNumber()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getFarmTotalAllocPoint - 팜 총 할당 포인트', () => {
    it('동작 테스트', async () => {
      const totalAllocPoint = await service.getFarmTotalAllocPoint();
      expect(totalAllocPoint.toNumber()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getFarmRewardPerBlock - 팜의 블록 당 리워드 수량', () => {
    it('동작 테스트', async () => {
      const rewardPerBlock = await service.getFarmRewardPerBlock();
      expect(rewardPerBlock.toNumber()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getFarmInfos - 팜 정보', () => {
    it('동작 테스트', async () => {
      const farmInfos = await service.getFarmInfos([0]);

      expect(farmInfos[0]).toHaveProperty('want');
      expect(farmInfos[0]).toHaveProperty('allocPoint');
      expect(farmInfos[0]).toHaveProperty('lastRewardBlock');
      expect(farmInfos[0]).toHaveProperty('accAUTOPerShare');
      expect(farmInfos[0]).toHaveProperty('strat');
    });
  });

  describe('getFarmStratShareTotal - 팜의 전략 풀의 총 유동량', () => {
    it('동작 테스트', async () => {
      return;
    });
  });
});
