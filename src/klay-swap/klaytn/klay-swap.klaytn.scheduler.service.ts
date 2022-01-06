import { Injectable } from '@nestjs/common';
import { BigNumber } from '@ethersproject/bignumber';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@seongeun/aggregator-util/lib/encodeDecode';
import { getBatchStaticAggregator } from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import { KlaySwapKlaytnBase } from './klay-swap.klaytn.base';

@Injectable()
export class KlaySwapKlaytnSchedulerService extends KlaySwapKlaytnBase {
  /***************************
   *  Public
   ***************************/
  async getDexFactoryTotalLength(): Promise<BigNumber> {
    return this.dexFactoryContract.getPoolCount();
  }

  async getDexFactoryInfos(pids: number[]): Promise<string[]> {
    const dexFactoryInfoEncode = pids.map((pid: number) => [
      this.dexFactory.address,
      encodeFunction(this.dexFactory.abi, 'getPoolAddress', [pid]),
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
            'getPoolAddress',
            returnData,
          )[0]
        : [];
    });
  }
}
