import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/test/test.module';
import { QuickSwapPolygonApiService } from './quick-swap.polygon.api.service';

describe('QuickSwapPolygonApiService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: QuickSwapPolygonApiService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<QuickSwapPolygonApiService>(
      QuickSwapPolygonApiService,
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
    it('pass', () => {
      return;
    });
  });
});
