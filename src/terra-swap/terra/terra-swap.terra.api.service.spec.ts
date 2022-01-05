import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/testing/test.module';
import { TerraSwapTerraApiService } from './terra-swap.terra.api.service';

describe('TerraSwapTerraApiService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: TerraSwapTerraApiService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<TerraSwapTerraApiService>(TerraSwapTerraApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Base. Accessor', () => {
    it('provider', async () => {
      expect(service.provider).toBeInstanceOf(Provider);
    });
  });
});
