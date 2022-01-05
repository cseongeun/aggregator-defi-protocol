import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/testing/test.module';
import { MdexHecoSchedulerService } from './mdex.heco.scheduler.service';

describe('MdexHecoSchedulerService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: MdexHecoSchedulerService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<MdexHecoSchedulerService>(MdexHecoSchedulerService);
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

    describe('getFarmIsMultiLP', () => {
      it('동작 테스트', async () => {
        return;
      });
    });

    describe('getFarmHalvingPeriod', () => {
      it('동작 테스트', async () => {
        const halvingPeriod = await service.getFarmHalvingPeriod();
        expect(halvingPeriod.toNumber()).toBeGreaterThanOrEqual(0);
      });
    });

    describe('getFarmPhase', () => {
      it('동작 테스트', async () => {
        const farmPhase = await service.getFarmPhase(10000);
        expect(farmPhase.toNumber()).toBeGreaterThanOrEqual(0);
      });
    });
    describe('getFarmStartBlock', () => {
      it('동작 테스트', async () => {
        const farmStartBlock = await service.getFarmStartBlock();
        expect(farmStartBlock.toNumber()).toBeGreaterThanOrEqual(0);
      });
    });

    describe('getFarmStartBlock', () => {
      it('동작 테스트', async () => {
        const farmStartBlock = await service.getFarmStartBlock();
        expect(farmStartBlock.toNumber()).toBeGreaterThanOrEqual(0);
      });
    });

    describe('getFarmReward', () => {
      it('동작 테스트', async () => {
        return;
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

        expect(farmInfos[0]).toHaveProperty('lpToken');
        expect(farmInfos[0]).toHaveProperty('allocPoint');
        expect(farmInfos[0]).toHaveProperty('lastRewardBlock');
        expect(farmInfos[0]).toHaveProperty('accMdxPerShare');
        expect(farmInfos[0]).toHaveProperty('accMultiLpPerShare');
        expect(farmInfos[0]).toHaveProperty('totalAmount');
      });
    });
  });

  describe('Dex Factory', () => {
    describe('getDexFactoryTotalLength', () => {
      it('동작 테스트', async () => {
        const totalLength = await service.getDEXFactoryTotalLength();
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
