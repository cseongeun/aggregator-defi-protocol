import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/testing/test.module';
import { SushiSwapPolygonApiService } from './sushi-swap.polygon.api.sevice';

describe('SushiSwapPolygonApiService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: SushiSwapPolygonApiService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<SushiSwapPolygonApiService>(
      SushiSwapPolygonApiService,
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

  describe('getFarmsByAddress', () => {
    it('pass', async () => {
      return;
    });
  });
});
