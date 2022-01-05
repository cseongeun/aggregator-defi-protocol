import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/testing/test.module';
import { SushiSwapAvalancheSchedulerService } from './sushi-swap.avalanche.scheduler.service';

describe('SushiSwapAvalancheSchedulerService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: SushiSwapAvalancheSchedulerService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<SushiSwapAvalancheSchedulerService>(
      SushiSwapAvalancheSchedulerService,
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

  describe('Dex Factory', () => {
    describe('getDexFactoryTotalLength ', () => {
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
