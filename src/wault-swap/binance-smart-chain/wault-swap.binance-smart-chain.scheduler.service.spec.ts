import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/testing/test.module';
import { WaultSwapBinanceSmartChainSchedulerService } from './wault-swap.binance-smart-chain.scheduler.service';

describe('WaultSwapBinanceSmartChainSchedulerService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: WaultSwapBinanceSmartChainSchedulerService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<WaultSwapBinanceSmartChainSchedulerService>(
      WaultSwapBinanceSmartChainSchedulerService,
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

  describe('farm', () => {
    describe('getFarmTotalLength', () => {
      it('동작 테스트', async () => {
        const totalLength = await service.getFarmTotalLength();
        expect(totalLength.toNumber()).toBeGreaterThanOrEqual(0);
      });
    });
    describe('getFarmTotalAllocPoint', () => {
      it('동작 테스트', async () => {
        const totalAllocPoint = await service.getFarmTotalAllocPoint();
        expect(totalAllocPoint.toNumber()).toBeGreaterThanOrEqual(0);
      });
    });

    describe('getFarmRewardPerBlock', () => {
      it('동작 테스트', async () => {
        const rewardPerBlock = await service.getFarmRewardPerBlock();
        expect(rewardPerBlock.toNumber()).toBeGreaterThanOrEqual(0);
      });
    });
    describe('getFarmInfos', () => {
      it('동작 테스트', async () => {
        const farmInfos = await service.getFarmInfos([0]);

        expect(farmInfos[0]).toHaveProperty('lpToken');
        expect(farmInfos[0]).toHaveProperty('allocPoint');
        expect(farmInfos[0]).toHaveProperty('lastRewardBlock');
        expect(farmInfos[0]).toHaveProperty('accWexPerShare');
      });
    });
  });
  describe('Dex Factory', () => {
    describe('getDexFactoryTotalLength ', () => {
      it('동작 테스트', async () => {
        const totalLength = await service.getDexFactoryTotalLength();
        expect(totalLength.toNumber()).toBeGreaterThanOrEqual(0);
      });
    });

    describe('getDexFactoryInfos', () => {
      it('동작 테스트', async () => {
        const pairInfos = await service.getDexFactoryInfos([0]);
        expect(Array.isArray(pairInfos)).toBe(true);
      });
    });
  });
});
