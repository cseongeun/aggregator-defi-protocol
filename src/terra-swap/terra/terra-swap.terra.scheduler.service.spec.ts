import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/test/test.module';
import { TerraSwapTerraSchedulerService } from './terra-swap.terra.scheduler.service';

describe('TerraSwapTerraSchedulerService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: TerraSwapTerraSchedulerService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<TerraSwapTerraSchedulerService>(
      TerraSwapTerraSchedulerService,
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
    describe('getDexFactoryInfos', () => {
      it('동작 테스트', async () => {
        const pairInfos = await service.getDexFactoryInfos(null);

        const pairs = pairInfos.pairs;

        expect(pairs[0]).toHaveProperty('asset_infos');
        expect(pairs[0]).toHaveProperty('contract_addr');
        expect(pairs[0]).toHaveProperty('liquidity_token');
      });
    });
  });
});
