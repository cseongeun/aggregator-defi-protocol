import { Injectable } from '@nestjs/common';
import { BigNumber } from '@ethersproject/bignumber';
import { ZERO, ZERO_ADDRESS } from '@seongeun/aggregator-util/lib/constant';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@seongeun/aggregator-util/lib/encodeDecode';
import { getBatchStaticAggregator } from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import {
  flat,
  toSplitWithChunkSize,
  zip,
} from '@seongeun/aggregator-util/lib/array';
import { isNull } from '@seongeun/aggregator-util/lib/type';
import { QuickSwapPolygonBase } from './quick-swap.polygon.base';

@Injectable()
export class QuickSwapPolygonSchedulerService extends QuickSwapPolygonBase {
  /***************************
   *  Public
   ***************************/
  // TODO: Change
  async getFarmTotalLength(): Promise<any> {
    return 4;
  }

  async getFarmTotalAllocPoint(): Promise<any> {
    return ZERO;
  }

  async getFarmRewardPerBlock(): Promise<any> {
    return ZERO;
  }

  async getFarmInfos(pids: number[]): Promise<
    ({
      farmAddress: string;
      stakingTokenAddress: string;
      rewardTokenAAddress: string;
      rewardTokenBAddress: string;
      totalSupply: BigNumber;
      rewardRateA: BigNumber;
      rewardRateB: BigNumber;
      periodFinish: BigNumber;
    } | null)[]
  > {
    const farmStakingTokenEncode = pids.map((pid: number) => [
      this.farmFactory.address,
      encodeFunction(this.farmFactory.abi, 'stakingTokens', [pid]),
    ]);

    const farmStakingTokenBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      farmStakingTokenEncode,
    );

    const farmStakingTokens = farmStakingTokenBatchCall.map(
      ({ success, returnData }) => {
        return validResult(success, returnData)
          ? decodeFunctionResultData(
              this.farmFactory.abi,
              'stakingTokens',
              returnData,
            )[0]
          : ZERO_ADDRESS;
      },
    );

    const farmStakingRewardsInfoByStakingTokenEncode = farmStakingTokens.map(
      (address: string) => [
        this.farmFactory.address,
        encodeFunction(
          this.farmFactory.abi,
          'stakingRewardsInfoByStakingToken',
          [address],
        ),
      ],
    );

    const farmStakingRewardsInfoByStakingTokenBatchCall =
      await getBatchStaticAggregator(
        this.provider,
        this.multiCallAddress,
        farmStakingRewardsInfoByStakingTokenEncode,
      );

    const farmStakingRewardsInfoByStakingToken =
      farmStakingRewardsInfoByStakingTokenBatchCall.map(
        ({ success, returnData }) => {
          return validResult(success, returnData)
            ? decodeFunctionResultData(
                this.farmFactory.abi,
                'stakingRewardsInfoByStakingToken',
                returnData,
              ).stakingRewards
            : ZERO_ADDRESS;
        },
      );

    const farmInfoEncode = farmStakingRewardsInfoByStakingToken.map(
      (address: string) => {
        return [
          [address, encodeFunction(this.farm.abi, 'stakingToken')],
          [address, encodeFunction(this.farm.abi, 'rewardsTokenA')],
          [address, encodeFunction(this.farm.abi, 'rewardsTokenB')],
          [address, encodeFunction(this.farm.abi, 'totalSupply')],
          [address, encodeFunction(this.farm.abi, 'rewardRateA')],
          [address, encodeFunction(this.farm.abi, 'rewardRateB')],
          [address, encodeFunction(this.farm.abi, 'periodFinish')],
        ];
      },
    );

    const farmInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      flat(farmInfoEncode),
    );

    const farmInfoBatchCallMap = toSplitWithChunkSize(farmInfoBatchCall, 7);

    const farmInfoBatchCallMapZip = zip(
      farmStakingRewardsInfoByStakingToken,
      farmInfoBatchCallMap,
    );

    return farmInfoBatchCallMapZip.map((zipResult) => {
      const [farmAddress, farmInfoResult] = zipResult;
      const [
        { success: stakingTokenSuccess, returnData: stakingTokenData },
        { success: rewardsTokenASuccess, returnData: rewardsTokenAData },
        { success: rewardsTokenBSuccess, returnData: rewardsTokenBData },
        { success: totalSupplySuccess, returnData: totalSupplyData },
        { success: rewardRateASuccess, returnData: rewardRateAData },
        { success: rewardRateBSuccess, returnData: rewardRateBData },
        { success: periodFinishSuccess, returnData: periodFinishData },
      ] = farmInfoResult;

      const stakingToken = validResult(stakingTokenSuccess, stakingTokenData)
        ? decodeFunctionResultData(
            this.farm.abi,
            'stakingToken',
            stakingTokenData,
          )[0]
        : null;
      const rewardTokenA = validResult(rewardsTokenASuccess, rewardsTokenAData)
        ? decodeFunctionResultData(
            this.farm.abi,
            'rewardsTokenA',
            rewardsTokenAData,
          )[0]
        : null;
      const rewardTokenB = validResult(rewardsTokenBSuccess, rewardsTokenBData)
        ? decodeFunctionResultData(
            this.farm.abi,
            'rewardsTokenB',
            rewardsTokenBData,
          )[0]
        : null;
      const totalSupply = validResult(totalSupplySuccess, totalSupplyData)
        ? decodeFunctionResultData(
            this.farm.abi,
            'totalSupply',
            totalSupplyData,
          )[0]
        : null;
      const rewardRateA = validResult(rewardRateASuccess, rewardRateAData)
        ? decodeFunctionResultData(
            this.farm.abi,
            'rewardRateA',
            rewardRateAData,
          )[0]
        : null;
      const rewardRateB = validResult(rewardRateBSuccess, rewardRateBData)
        ? decodeFunctionResultData(
            this.farm.abi,
            'rewardRateB',
            rewardRateBData,
          )[0]
        : null;
      const periodFinish = validResult(periodFinishSuccess, periodFinishData)
        ? decodeFunctionResultData(
            this.farm.abi,
            'periodFinish',
            periodFinishData,
          )[0]
        : null;

      if (
        isNull(stakingToken) ||
        isNull(rewardTokenA) ||
        isNull(rewardTokenB) ||
        isNull(totalSupply) ||
        isNull(rewardRateA) ||
        isNull(rewardRateB) ||
        isNull(periodFinish)
      ) {
        return null;
      }

      return {
        farmAddress,
        stakingTokenAddress: stakingToken,
        rewardTokenAAddress: rewardTokenA,
        rewardTokenBAddress: rewardTokenB,
        totalSupply,
        rewardRateA,
        rewardRateB,
        periodFinish,
      };
    });
  }

  async getFarm2TotalLength(): Promise<any> {
    return 117;
  }

  async getFarm2Infos(pids: number[]): Promise<
    ({
      farmAddress: string;
      stakingTokenAddress: string;
      rewardsTokenAddress: string;
      totalSupply: BigNumber;
      rewardRate: BigNumber;
      periodFinish: BigNumber;
    } | null)[]
  > {
    const farmStakingTokenEncode = pids.map((pid: number) => [
      this.farm2Factory.address,
      encodeFunction(this.farm2Factory.abi, 'stakingTokens', [pid]),
    ]);

    const farmStakingTokenBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      farmStakingTokenEncode,
    );

    const farmStakingTokens = farmStakingTokenBatchCall.map(
      ({ success, returnData }) => {
        return validResult(success, returnData)
          ? decodeFunctionResultData(
              this.farm2Factory.abi,
              'stakingTokens',
              returnData,
            )[0]
          : ZERO_ADDRESS;
      },
    );

    const farmStakingRewardsInfoByStakingTokenEncode = farmStakingTokens.map(
      (address: string) => [
        this.farm2Factory.address,
        encodeFunction(
          this.farm2Factory.abi,
          'stakingRewardsInfoByStakingToken',
          [address],
        ),
      ],
    );

    const farmStakingRewardsInfoByStakingTokenBatchCall =
      await getBatchStaticAggregator(
        this.provider,
        this.multiCallAddress,
        farmStakingRewardsInfoByStakingTokenEncode,
      );

    const farmStakingRewardsInfoByStakingToken =
      farmStakingRewardsInfoByStakingTokenBatchCall.map(
        ({ success, returnData }) => {
          return validResult(success, returnData)
            ? decodeFunctionResultData(
                this.farm2Factory.abi,
                'stakingRewardsInfoByStakingToken',
                returnData,
              ).stakingRewards
            : ZERO_ADDRESS;
        },
      );

    const farmInfoEncode = farmStakingRewardsInfoByStakingToken.map(
      (address: string) => {
        return [
          [address, encodeFunction(this.farm2.abi, 'stakingToken')],
          [address, encodeFunction(this.farm2.abi, 'rewardsToken')],
          [address, encodeFunction(this.farm2.abi, 'totalSupply')],
          [address, encodeFunction(this.farm2.abi, 'rewardRate')],
          [address, encodeFunction(this.farm2.abi, 'periodFinish')],
        ];
      },
    );

    const farmInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      flat(farmInfoEncode),
    );

    const farmInfoBatchCallMap = toSplitWithChunkSize(farmInfoBatchCall, 5);

    const farmInfoBatchCallMapZip = zip(
      farmStakingRewardsInfoByStakingToken,
      farmInfoBatchCallMap,
    );

    return farmInfoBatchCallMapZip.map((zipResult) => {
      const [farmAddress, farmInfoResult] = zipResult;

      const [
        { success: stakingTokenSuccess, returnData: stakingTokenData },
        { success: rewardsTokenSuccess, returnData: rewardsTokenData },
        { success: totalSupplySuccess, returnData: totalSupplyData },
        { success: rewardRateSuccess, returnData: rewardRateData },
        { success: periodFinishSuccess, returnData: periodFinishData },
      ] = farmInfoResult;

      const stakingToken = validResult(stakingTokenSuccess, stakingTokenData)
        ? decodeFunctionResultData(
            this.farm2.abi,
            'stakingToken',
            stakingTokenData,
          )[0]
        : null;
      const rewardsToken = validResult(rewardsTokenSuccess, rewardsTokenData)
        ? decodeFunctionResultData(
            this.farm2.abi,
            'rewardsToken',
            rewardsTokenData,
          )[0]
        : null;

      const totalSupply = validResult(totalSupplySuccess, totalSupplyData)
        ? decodeFunctionResultData(
            this.farm2.abi,
            'totalSupply',
            totalSupplyData,
          )[0]
        : null;
      const rewardRate = validResult(rewardRateSuccess, rewardRateData)
        ? decodeFunctionResultData(
            this.farm2.abi,
            'rewardRate',
            rewardRateData,
          )[0]
        : null;
      const periodFinish = validResult(periodFinishSuccess, periodFinishData)
        ? decodeFunctionResultData(
            this.farm2.abi,
            'periodFinish',
            periodFinishData,
          )[0]
        : null;

      if (
        isNull(stakingToken) ||
        isNull(rewardsToken) ||
        isNull(totalSupply) ||
        isNull(rewardRate) ||
        isNull(periodFinish)
      ) {
        return null;
      }

      return {
        farmAddress,
        stakingTokenAddress: stakingToken,
        rewardsTokenAddress: rewardsToken,
        totalSupply,
        rewardRate,
        periodFinish,
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
