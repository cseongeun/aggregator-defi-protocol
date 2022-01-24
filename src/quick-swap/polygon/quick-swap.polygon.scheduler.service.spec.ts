import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/test/test.module';
import { QuickSwapPolygonSchedulerService } from './quick-swap.polygon.scheduler.service';

describe('QuickSwapPolygonSchedulerService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: QuickSwapPolygonSchedulerService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<QuickSwapPolygonSchedulerService>(
      QuickSwapPolygonSchedulerService,
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

  describe('Farm', () => {
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
        const farmRewardBlockBlock = await service.getFarmRewardPerBlock();
        expect(farmRewardBlockBlock.toNumber()).toBeGreaterThanOrEqual(0);
      });
    });

    describe('getFarmInfos', () => {
      it('동작 테스트', async () => {
        const farmInfos = await service.getFarmInfos([0]);
        console.log(farmInfos);

        expect(farmInfos[0]).toHaveProperty('farmAddress');
        expect(farmInfos[0]).toHaveProperty('stakingTokenAddress');
        expect(farmInfos[0]).toHaveProperty('rewardTokenAAddress');
        expect(farmInfos[0]).toHaveProperty('rewardTokenBAddress');
        expect(farmInfos[0]).toHaveProperty('totalSupply');
        expect(farmInfos[0]).toHaveProperty('rewardRateA');
        expect(farmInfos[0]).toHaveProperty('rewardRateB');
        expect(farmInfos[0]).toHaveProperty('periodFinish');
      });
    });
  });

  describe('Farm2', () => {
    describe('getFarm2TotalLength', () => {
      it('동작 테스트', async () => {
        const totalLength = await service.getFarm2TotalLength();
        expect(totalLength).toBeGreaterThanOrEqual(0);
      });
    });
    describe('getFarm2Infos', () => {
      it('동작 테스트', async () => {
        const farmInfos = await service.getFarm2Infos([1]);

        expect(farmInfos[0]).toHaveProperty('farmAddress');
        expect(farmInfos[0]).toHaveProperty('stakingTokenAddress');
        expect(farmInfos[0]).toHaveProperty('rewardsTokenAddress');
        expect(farmInfos[0]).toHaveProperty('totalSupply');
        expect(farmInfos[0]).toHaveProperty('rewardRate');
        expect(farmInfos[0]).toHaveProperty('periodFinish');
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
