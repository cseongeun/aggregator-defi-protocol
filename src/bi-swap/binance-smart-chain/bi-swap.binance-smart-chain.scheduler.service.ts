import { Injectable } from '@nestjs/common';
import { BigNumber } from 'ethers';
import { div, mul } from '@seongeun/aggregator-util/lib/bignumber';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@seongeun/aggregator-util/lib/encodeDecode';
import { getBatchStaticAggregator } from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import { BiSwapBinanceSmartChainBase } from './bi-swap.binance-smart-chain.base';

@Injectable()
export class BiSwapBinanceSmartChainSchedulerService extends BiSwapBinanceSmartChainBase {
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
    const [rewardPerBlock, stakePercent, percentDec] = await Promise.all([
      this.farmContract.BSWPerBlock(),
      this.farmContract.stakingPercent(),
      this.farmContract.percentDec(),
    ]);

    return BigNumber.from(
      div(mul(rewardPerBlock, stakePercent), percentDec).toString(),
    );
  }

  async getFarmInfos(pids: number[]): Promise<
    {
      lpToken: string;
      allocPoint: BigNumber;
      lastRewardBlock: BigNumber;
      accBSWPerShare: BigNumber;
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
        : null;
    });
  }

  async getDexFactoryTotalLength(): Promise<BigNumber> {
    return this.dexFactoryContract.allPairsLength();
  }

  async getDexFactoryInfos(pids: number[]): Promise<string[]> {
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
}
