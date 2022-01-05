import { Injectable } from '@nestjs/common';
import { BigNumber } from '@ethersproject/bignumber';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@seongeun/aggregator-util/lib/encodeDecode';
import { getBatchStaticAggregator } from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import { MdexHecoBase } from './mdex.heco.base';

@Injectable()
export class MdexHecoSchedulerService extends MdexHecoBase {
  /***************************
   *  Public
   ***************************/
  async getFarmTotalLength(): Promise<BigNumber> {
    return this.farmContract.poolLength();
  }

  async getFarmTotalAllocPoint(): Promise<BigNumber> {
    return this.farmContract.totalAllocPoint();
  }

  async getFarmIsMultiLP(address: string): Promise<boolean> {
    return this.farmContract.isMultiLP(address);
  }

  async getFarmHalvingPeriod(): Promise<BigNumber> {
    return this.farmContract.halvingPeriod();
  }

  async getFarmPhase(blockNumber: any): Promise<BigNumber> {
    return this.farmContract.phase(blockNumber);
  }

  async getFarmStartBlock(): Promise<BigNumber> {
    return this.farmContract.startBlock();
  }

  async getFarmReward(blockNumber: any): Promise<BigNumber> {
    return this.farmContract.reward(blockNumber);
  }

  // https://bscscan.com/address/0xc48fe252aa631017df253578b1405ea399728a50#code L975, L1023 (해빙기 적용 필요)
  async getFarmRewardPerBlock(): Promise<BigNumber> {
    return this.farmContract.mdxPerBlock();
  }

  async getFarmInfos(pids: number[]): Promise<
    {
      lpToken: string;
      allocPoint: BigNumber;
      lastRewardBlock: BigNumber;
      accMdxPerShare: BigNumber;
      accMultiLpPerShare: BigNumber;
      totalAmount: BigNumber;
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
