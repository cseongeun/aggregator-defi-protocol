import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/test/test.module';
import { MdexHecoApiService } from './mdex.heco.api.service';

describe('MdexHecoApiService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: MdexHecoApiService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<MdexHecoApiService>(MdexHecoApiService);
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
