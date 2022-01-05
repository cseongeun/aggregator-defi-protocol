import { Injectable } from '@nestjs/common';
import { BigNumber } from '@ethersproject/bignumber';
import {
  flat,
  toSplitWithChunkSize,
} from '@seongeun/aggregator-util/lib/array';
import { ZERO } from '@seongeun/aggregator-util/lib/constant';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@seongeun/aggregator-util/lib/encodeDecode';
import { getBatchStaticAggregator } from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import { isNull } from '@seongeun/aggregator-util/lib/type';
import { SushiSwapPolygonBase } from './sushi-swap.polygon.base';

@Injectable()
export class SushiSwapPolygonSchedulerService extends SushiSwapPolygonBase {
  /***************************
   *  Public
   ***************************/
  async getFarmTotalLength(): Promise<BigNumber> {
    return this.farmContract.poolLength();
  }

  async getFarmTotalAllocPoint(): Promise<BigNumber> {
    return this.farmContract.totalAllocPoint();
  }

  async getFarmRewardPerBlock(): Promise<any> {
    return ZERO;
  }

  async getFarmRewardPerSecond(): Promise<BigNumber> {
    return this.farmContract.sushiPerSecond;
  }

  /**
   * https://polygonscan.com/address/0xa3378Ca78633B3b9b2255EAa26748770211163AE#code L:674 "private variable reward token"
   */
  getFarmRewarderRewardToken(): string {
    return '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';
  }

  async getFarmRewarderRewardPerSecond(address: string): Promise<BigNumber> {
    return this.farmRewarderContract(address).rewardPerSecond();
  }

  async getFarmInfos(
    pids: number[],
  ): Promise<{ lpToken: string; allocPoint: BigNumber; rewarder: string }[]> {
    const farmInfoEncode = pids.map((pid: number) => [
      [this.farm.address, encodeFunction(this.farm.abi, 'poolInfo', [pid])],
      [this.farm.address, encodeFunction(this.farm.abi, 'lpToken', [pid])],
      [this.farm.address, encodeFunction(this.farm.abi, 'rewarder', [pid])],
    ]);

    const farmInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      flat(farmInfoEncode),
    );

    const farmInfoBatchCallMap = toSplitWithChunkSize(farmInfoBatchCall, 3);

    return farmInfoBatchCallMap.map((result) => {
      const [
        { success: poolInfoSuccess, returnData: poolInfoData },
        { success: lpTokenSuccess, returnData: lpTokenData },
        { success: rewarderSuccess, returnData: rewarderData },
      ] = result;

      const poolInfo = validResult(poolInfoSuccess, poolInfoData)
        ? decodeFunctionResultData(this.farm.abi, 'poolInfo', poolInfoData)
        : null;

      const lpToken = validResult(lpTokenSuccess, lpTokenData)
        ? decodeFunctionResultData(this.farm.abi, 'lpToken', lpTokenData)[0]
        : null;

      const rewarder = validResult(rewarderSuccess, rewarderData)
        ? decodeFunctionResultData(this.farm.abi, 'rewarder', rewarderData)[0]
        : null;

      if (isNull(poolInfo) || isNull(lpToken) || isNull(rewarder)) {
        return null;
      }

      return {
        allocPoint: poolInfo.allocPoint,
        lpToken,
        rewarder,
      };
    });
  }

  async getDEXFactoryTotalLength(): Promise<BigNumber> {
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
