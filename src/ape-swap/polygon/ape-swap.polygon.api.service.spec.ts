import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/test/test.module';
import { ApeSwapPolygonApiService } from './ape-swap.polygon.api.service';

describe('ApeSwapPolygonApiService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: ApeSwapPolygonApiService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<ApeSwapPolygonApiService>(ApeSwapPolygonApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Base. Accessor', () => {
    it('provider', async () => {
      expect(service.provider).toBeInstanceOf(Provider);
    });
  });

  describe('getFarmsByAddress', () => {
    it('pass', () => {
      return;
    });
  });
});
