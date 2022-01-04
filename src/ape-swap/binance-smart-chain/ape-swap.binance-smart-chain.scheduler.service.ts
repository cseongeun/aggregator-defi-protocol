import { Injectable } from '@nestjs/common';
import { BigNumber } from 'ethers';
import { Provider } from '@ethersproject/providers';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@seongeun/aggregator-util/lib/encodeDecode';
import {
  getBatchERC721TokenInfos,
  getBatchStaticAggregator,
} from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import { ApeSwapBinanceSmartChainBase } from './ape-swap.binance-smart-chain.base';

@Injectable()
export class ApeSwapBinanceSmartChainSchedulerService extends ApeSwapBinanceSmartChainBase {
  /***************************
   *  Public
   ***************************/
  async getFarmTotalLength(): Promise<BigNumber> {
    return this.farmContract.poolLength();
  }

  async getFarmTotalAllocPoint(): Promise<BigNumber> {
    return this.farmContract.totalAllocPoint();
  }

  async getFarmRewardPerBlock(): Promise<BigNumber> {
    return this.farmContract.cakePerBlock();
  }

  async getFarmInfos(pids: number[]): Promise<
    {
      lpToken: string;
      allocPoint: BigNumber;
      lastRewardBlock: BigNumber;
      accCakePerShare: BigNumber;
    }[]
  > {
    const farmInfoEncode = pids.map((pid: number) => [
      this.farm.address,
      encodeFunction(this.farm.abi, 'poolInfo', [pid]),
    ]);

    const farmInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      farmInfoEncode,
    );

    return farmInfoBatchCall.map(({ success, returnData }) => {
      return validResult(success, returnData)
        ? decodeFunctionResultData(this.farm.abi, 'poolInfo', returnData)
        : [];
    });
  }

  async getDEXFactoryTotalLength(): Promise<BigNumber> {
    return this.dexFactoryContract.allPairsLength();
  }

  async getDEXFactoryInfos(pids: number[]): Promise<string[]> {
    const dexFactoryInfoEncode = pids.map((pid: number) => [
      this.dexFactory.address,
      encodeFunction(this.dexFactory.abi, 'allPairs', [pid]),
    ]);

    const dexFactoryInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      dexFactoryInfoEncode,
    );

    return dexFactoryInfoBatchCall.map(({ success, returnData }) => {
      return validResult(success, returnData)
        ? decodeFunctionResultData(
            this.dexFactory.abi,
            'allPairs',
            returnData,
          )[0]
        : [];
    });
  }

  async getNFTokenTotalSupply(): Promise<BigNumber> {
    return this.nfTokenContract.totalSupply();
  }

  async getNFTokenInfos(pids: number[]): Promise<
    {
      id: BigNumber;
      owner: string;
      tokenURI: string;
    }[]
  > {
    return getBatchERC721TokenInfos(
      this.provider,
      this.multiCallAddress,
      this.nfToken.address,
      pids,
    );
  }
}
