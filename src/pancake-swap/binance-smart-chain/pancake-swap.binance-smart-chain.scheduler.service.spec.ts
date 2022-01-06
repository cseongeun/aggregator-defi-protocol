import { Provider } from '@ethersproject/providers';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../../extension/testing/test.module';
import { PancakeSwapBinanceSmartChainSchedulerService } from './pancake-swap.binance-smart-chain.scheduler.service';

describe('PancakeSwapBinanceSmartChainSchedulerService', () => {
  const testModule = new TestModule();
  let app: INestApplication;
  let service: PancakeSwapBinanceSmartChainSchedulerService;

  beforeAll(async () => {
    app = await testModule.createTestModule();
    service = await app.get<PancakeSwapBinanceSmartChainSchedulerService>(
      PancakeSwapBinanceSmartChainSchedulerService,
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

  describe('Farm', () => {
    describe('getFarmTotalLength', () => {
      it('동작 테스트', async () => {
        const totalLength = await service.getFarmTotalLength();
        expect(totalLength.toNumber()).toBeGreaterThanOrEqual(0);
      });
    });

    describe('getFarmTotalAllocPoint', () => {
      it('동작 테스트', async () => {
        const totalAllocPoint = await service.getFarmTotalAllocPoint();
        expect(totalAllocPoint.toNumber()).toBeGreaterThanOrEqual(0);
      });
    });

    describe('getFarmRewardPerBlock', () => {
      it('동작 테스트', async () => {
        const farmRewardBlockBlock = await service.getFarmRewardPerBlock();
        expect(farmRewardBlockBlock.toNumber()).toBeGreaterThanOrEqual(0);
      });
    });

    describe('getFarmInfos', () => {
      it('동작 테스트', async () => {
        const farmInfos = await service.getFarmInfos([0]);

        expect(farmInfos[0]).toHaveProperty('lpToken');
        expect(farmInfos[0]).toHaveProperty('allocPoint');
        expect(farmInfos[0]).toHaveProperty('lastRewardBlock');
        expect(farmInfos[0]).toHaveProperty('accCakePerShare');
      });
    });
  });

  describe('Farm2', () => {
    describe('getFarm2TotalLength', () => {
      it('동작 테스트', async () => {
        const totalLength = await service.getFarm2TotalLength();
        expect(totalLength).toBeGreaterThanOrEqual(0);
      });
    });
    describe('getFarm2Infos', () => {
      it('동작 테스트', async () => {
        const farmInfos = await service.getFarm2Infos(1);
        console.log(farmInfos);
        expect(farmInfos[0]).toHaveProperty('id');
        expect(farmInfos[0]).toHaveProperty('reward');
        expect(farmInfos[0]).toHaveProperty('startBlock');
        expect(farmInfos[0]).toHaveProperty('endBlock');
        expect(farmInfos[0]).toHaveProperty('stakeToken');
        expect(farmInfos[0]).toHaveProperty('stakeToken.id');
        expect(farmInfos[0]).toHaveProperty('stakeToken.name');
        expect(farmInfos[0]).toHaveProperty('stakeToken.decimals');
        expect(farmInfos[0]).toHaveProperty('stakeToken.symbol');
        expect(farmInfos[0]).toHaveProperty('earnToken');
        expect(farmInfos[0]).toHaveProperty('earnToken.id');
        expect(farmInfos[0]).toHaveProperty('earnToken.name');
        expect(farmInfos[0]).toHaveProperty('earnToken.decimals');
        expect(farmInfos[0]).toHaveProperty('earnToken.symbol');
      });
    });
  });

  describe('nfToken', () => {
    describe('getNFTokenTotalSupply', () => {
      it('동작 테스트', async () => {
        const totalSupply = await service.getNFTokenTotalSupply();
        expect(totalSupply.toNumber()).toBeGreaterThanOrEqual(0);
      });
    });
    describe('getNFTokenInfos', () => {
      it('동작 테스트', async () => {
        const tokenInfos = await service.getNFTokenInfos([0]);
        expect(tokenInfos[0]).toHaveProperty('id');
        expect(tokenInfos[0]).toHaveProperty('owner');
        expect(tokenInfos[0]).toHaveProperty('tokenURI');
      });
    });
  });

  describe('nfToken2', () => {
    describe('getNFToken2TotalSupply', () => {
      it('동작 테스트', async () => {
        const totalSupply = await service.getNFToken2TotalSupply();
        expect(totalSupply.toNumber()).toBeGreaterThanOrEqual(0);
      });
    });
    describe('getNFToken2Infos', () => {
      it('동작 테스트', async () => {
        const tokenInfos = await service.getNFToken2Infos([0]);
        expect(tokenInfos[0]).toHaveProperty('id');
        expect(tokenInfos[0]).toHaveProperty('owner');
        expect(tokenInfos[0]).toHaveProperty('tokenURI');
      });
    });
  });
  describe('nfToken3', () => {
    describe('getNFToken3TotalSupply', () => {
      it('동작 테스트', async () => {
        const totalSupply = await service.getNFToken3TotalSupply();
        expect(totalSupply.toNumber()).toBeGreaterThanOrEqual(0);
      });
    });
    describe('getNFToken3Infos', () => {
      it('동작 테스트', async () => {
        const tokenInfos = await service.getNFToken3Infos([0]);
        expect(tokenInfos[0]).toHaveProperty('id');
        expect(tokenInfos[0]).toHaveProperty('owner');
        expect(tokenInfos[0]).toHaveProperty('tokenURI');
      });
    });
  });
  describe('nfToken4', () => {
    describe('getNFToken4TotalSupply', () => {
      it('동작 테스트', async () => {
        const totalSupply = await service.getNFToken4TotalSupply();
        expect(totalSupply.toNumber()).toBeGreaterThanOrEqual(0);
      });
    });
    describe('getNFToken4Infos', () => {
      it('동작 테스트', async () => {
        const tokenInfos = await service.getNFToken4Infos([0]);
        expect(tokenInfos[0]).toHaveProperty('id');
        expect(tokenInfos[0]).toHaveProperty('owner');
        expect(tokenInfos[0]).toHaveProperty('tokenURI');
      });
    });
  });
  describe('nfToken5', () => {
    describe('getNFToken5TotalSupply', () => {
      it('동작 테스트', async () => {
        const totalSupply = await service.getNFToken5TotalSupply();
        expect(totalSupply.toNumber()).toBeGreaterThanOrEqual(0);
      });
    });
    describe('getNFToken5Infos', () => {
      it('동작 테스트', async () => {
        const tokenInfos = await service.getNFToken5Infos([0]);
        expect(tokenInfos[0]).toHaveProperty('id');
        expect(tokenInfos[0]).toHaveProperty('owner');
        expect(tokenInfos[0]).toHaveProperty('tokenURI');
      });
    });
  });

  describe('Dex Factory', () => {
    describe('getDexFactoryTotalLength ', () => {
      it('동작 테스트', async () => {
        const totalLength = await service.getDexFactoryTotalLength();
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
