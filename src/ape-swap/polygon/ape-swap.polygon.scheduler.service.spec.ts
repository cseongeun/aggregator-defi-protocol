import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/testing/test.module';
import { ApeSwapPolygonSchedulerService } from './ape-swap.polygon.scheduler.service';

describe('ApeSwapPolygonSchedulerService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: ApeSwapPolygonSchedulerService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<ApeSwapPolygonSchedulerService>(
      ApeSwapPolygonSchedulerService,
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
    describe('getFarmTotalLength - 팜 총 갯수', () => {
      it('동작 테스트', async () => {
        const totalLength = await service.getFarmTotalLength();
        console.log(totalLength);
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
        expect(rewardPerBlock.toNumber()).toBe(0);
      });
    });

    describe('getFarmRewardPerSecond - 팜의 초당 리워드 수량', () => {
      it('동작 테스트', async () => {
        const rewardPerBlock = await service.getFarmRewardPerSecond();
        expect(rewardPerBlock.toNumber()).toBeGreaterThanOrEqual(0);
      });
    });

    describe('getFarmRewarderRewardPerSecond - 팜의 추가 리워드의 초당 리워드 수량', () => {
      it('동작 테스트', async () => {
        return;
      });
    });

    describe('getFarmInfos - 팜 정보', () => {
      it('동작 테스트', async () => {
        const farmInfos = await service.getFarmInfos([0]);

        expect(farmInfos[0]).toHaveProperty('lpToken');
        expect(farmInfos[0]).toHaveProperty('allocPoint');
        expect(farmInfos[0]).toHaveProperty('rewarder');
      });
    });
  });

  describe('Dex', () => {
    describe('getDexFactoryTotalLength - Dex의 총 유동풀 갯수', () => {
      it('동작 테스트', async () => {
        const totalLength = await service.getDexFactoryTotalLength();
        expect(totalLength.toNumber()).toBeGreaterThanOrEqual(0);
      });
    });

    describe('getDexFactoryInfos - Dex의 페어 주소', () => {
      it('동작 테스트', async () => {
        const pairInfos = await service.getDexFactoryInfos([0]);
        expect(pairInfos[0]).toBeInstanceOf(String);
      });
    });
  });
});
