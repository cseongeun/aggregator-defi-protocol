import { Injectable } from '@nestjs/common';
import { BigNumber } from '@ethersproject/bignumber';
import { zip } from '@seongeun/aggregator-util/lib/array';
import { ZERO_ADDRESS } from '@seongeun/aggregator-util/lib/constant';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@seongeun/aggregator-util/lib/encodeDecode';
import { getBatchStaticAggregator } from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import { BakerySwapBinanceSmartChainBase } from './bakery-swap.binance-smart-chain.base';

@Injectable()
export class BakerySwapBinanceSmartChainSchedulerService extends BakerySwapBinanceSmartChainBase {
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
    return this.farmContract.tokenPerBlock();
  }

  async getFarmInfos(pids: number[]): Promise<
    {
      lpToken: string;
      allocPoint: BigNumber;
      lastRewardBlock: BigNumber;
      accTokenPerShare: BigNumber;
      exists: boolean;
    }[]
  > {
    const farmAddressesEncode = pids.map((pid: number) => [
      this.farm.address,
      encodeFunction(this.farm.abi, 'poolAddresses', [pid]),
    ]);

    const farmAddressesBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      farmAddressesEncode,
    );

    const farmAddresses = farmAddressesBatchCall.map(
      ({ success, returnData }) => {
        return validResult(success, returnData)
          ? decodeFunctionResultData(
              this.farm.abi,
              'poolAddresses',
              returnData,
            )[0]
          : ZERO_ADDRESS;
      },
    );

    const farmInfoEncode = farmAddresses.map((address: string) => [
      this.farm.address,
      encodeFunction(this.farm.abi, 'poolInfoMap', [address]),
    ]);

    const farmInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      farmInfoEncode,
    );

    const farmAddressInfoZip = zip(farmAddresses, farmInfoBatchCall);

    return farmAddressInfoZip.map((zipResult) => {
      const [farmAddress, farmInfo] = zipResult;

      const { success, returnData } = farmInfo;
      return validResult(success, returnData)
        ? {
            lpToken: farmAddress,
            ...decodeFunctionResultData(
              this.farm.abi,
              'poolInfoMap',
              returnData,
            ),
          }
        : null;
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
