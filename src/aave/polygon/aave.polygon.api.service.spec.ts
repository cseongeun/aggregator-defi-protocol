import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/test/test.module';
import { AavePolygonApiService } from './aave.polygon.api.service';

describe('AavePolygonApiService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: AavePolygonApiService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<AavePolygonApiService>(AavePolygonApiService);
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
