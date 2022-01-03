import { TestModule } from '../../app/app.test.module';
import { INestApplication } from '@nestjs/common';
import { AirNFTBSCService } from './air-nft.bsc.service';

describe('AirNFTBSCService', () => {
  const testModule = new TestModule();
  let app: INestApplication;

  let service: AirNFTBSCService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = app.get<AirNFTBSCService>(AirNFTBSCService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNFTInfos', () => {
    it('is working', async () => {
      const result = await service.getWalletNFTokens('0xFDcBF476B286796706e273F86aC51163DA737FA8');
      console.log(result);
    });
  });

  describe('getWalletNFTs', () => {
    it('is working', async () => {
      const result = await service.getWalletNFTokens('0xFDcBF476B286796706e273F86aC51163DA737FA8');
      console.log(JSON.stringify(result));
    });
  });
});
