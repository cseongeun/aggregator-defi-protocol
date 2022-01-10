import { Injectable } from '@nestjs/common';
import { BigNumber } from 'ethers';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@seongeun/aggregator-util/lib/encodeDecode';
import { getBatchStaticAggregator } from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import { AutoFarmBinanceSmartChainBase } from './auto-farm.binance-smart-chain.base';

@Injectable()
export class AutoFarmBinanceSmartChainSchedulerService extends AutoFarmBinanceSmartChainBase {
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
    return this.farmContract.AUTOPerBlock();
  }

  async getFarmInfos(pids: number[]): Promise<
    {
      want: string;
      allocPoint: BigNumber;
      lastRewardBlock: BigNumber;
      accAUTOPerShare: BigNumber;
      strat: string;
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

  async getFarmStratShareTotal(address: string): Promise<BigNumber> {
    return this.farmStratContract(address).sharesTotal();
  }

  async getFarmStratShareTotalInfos(addresses: string[]): Promise<BigNumber[]> {
    const farmStratShareTotalInfoEncode = addresses.map((address: string) => [
      address,
      encodeFunction(this.farmStrat.abi, 'sharesTotal'),
    ]);

    const farmStratShareTotalInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      farmStratShareTotalInfoEncode,
    );

    return farmStratShareTotalInfoBatchCall.map(({ success, returnData }) => {
      return validResult(success, returnData)
        ? decodeFunctionResultData(
            this.farmStrat.abi,
            'sharesTotal',
            returnData,
          )[0]
        : null;
    });
  }
}
