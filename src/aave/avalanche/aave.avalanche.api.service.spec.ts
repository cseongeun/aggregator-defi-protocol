import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/test/test.module';
import { AaveAvalancheApiService } from './aave.avalanche.api.service';

describe('AaveAvalancheApiService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: AaveAvalancheApiService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<AaveAvalancheApiService>(AaveAvalancheApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Base. Accessor', () => {
    it('provider', async () => {
      expect(service.provider).toBeInstanceOf(Provider);
    });
  });

  describe('Api. getLendingsByAddress', () => {
    it('pass', () => {
      return;
    });
  });
});
