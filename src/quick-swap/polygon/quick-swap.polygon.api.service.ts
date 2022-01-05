import { Injectable } from '@nestjs/common';
import { Farm, Token } from '@seongeun/aggregator-base/lib/entity';
import {
  flat,
  groupBy,
  toSplitWithChunkSize,
  zip,
} from '@seongeun/aggregator-util/lib/array';
import { isZero } from '@seongeun/aggregator-util/lib/bignumber';
import { ZERO } from '@seongeun/aggregator-util/lib/constant';
import { divideDecimals } from '@seongeun/aggregator-util/lib/decimals';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@seongeun/aggregator-util/lib/encodeDecode';
import { getBatchStaticAggregator } from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import { get } from '@seongeun/aggregator-util/lib/object';
import { isUndefined } from '@seongeun/aggregator-util/lib/type';
import { QuickSwapPolygonBase } from './quick-swap.polygon.base';

@Injectable()
export class QuickSwapPolygonApiService extends QuickSwapPolygonBase {
  /***************************
   *  FOR ADDRESS
   ***************************/
  async getFarmsByAddress(farms: Farm[], address: string): Promise<any> {
    const farmGrouped = groupBy(farms, 'name');

    const [farmInfos, farm2Infos] = await Promise.all([
      this._trackingFarmsByAddress(farmGrouped[this.farm.name], address),
      this._trackingFarms2ByAddress(farmGrouped[this.farm2.name], address),
    ]);

    return farmInfos.concat(farm2Infos);
  }

  /***************************
   *  Private
   ***************************/
  private async _trackingFarmsByAddress(
    farms: Farm[],
    address: string,
  ): Promise<any> {
    if (isUndefined(farms)) return [];

    const farmInfoEncode = farms.map(({ address: farmAddress }) => {
      return [
        [farmAddress, encodeFunction(this.farm.abi, 'balanceOf', [address])],
        [farmAddress, encodeFunction(this.farm.abi, 'earnedA', [address])],
        [farmAddress, encodeFunction(this.farm.abi, 'earnedB', [address])],
      ];
    });

    const farmInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      flat(farmInfoEncode),
    );

    const farmInfoBatchCallMap = toSplitWithChunkSize(farmInfoBatchCall, 3);
    const farmInfoZip = zip(farms, farmInfoBatchCallMap);

    return this._formatFarmResult(farmInfoZip);
  }

  private async _trackingFarms2ByAddress(
    farms: Farm[],
    address: string,
  ): Promise<any> {
    if (isUndefined(farms)) return [];

    const farmInfoEncode = farms.map(({ address: farmAddress }) => {
      return [
        [farmAddress, encodeFunction(this.farm2.abi, 'balanceOf', [address])],
        [farmAddress, encodeFunction(this.farm2.abi, 'earned', [address])],
      ];
    });

    const farmInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      flat(farmInfoEncode),
    );

    const farmInfoBatchCallMap = toSplitWithChunkSize(farmInfoBatchCall, 2);
    const farmInfoZip = zip(farms, farmInfoBatchCallMap);

    return this._formatFarm2Result(farmInfoZip);
  }
  private _formatFarmResult(farmInfoZip: any) {
    const output = [];

    farmInfoZip.forEach(([farm, infoResult]) => {
      const { stakeTokens, rewardTokens, data } = farm;

      const [
        { success: balanceOfSuccess, returnData: balanceOfData },
        { success: earnedASuccess, returnData: earnedAData },
        { success: earnedBSuccess, returnData: earnedBData },
      ] = infoResult;

      const stakedAmountOfAddress = validResult(balanceOfSuccess, balanceOfData)
        ? decodeFunctionResultData(this.farm.abi, 'balanceOf', balanceOfData)
        : ZERO;

      const rewardAAmountOfAddress = validResult(earnedASuccess, earnedAData)
        ? decodeFunctionResultData(this.farm.abi, 'earnedA', earnedAData)
        : ZERO;

      const rewardBAmountOfAddress = validResult(earnedBSuccess, earnedBData)
        ? decodeFunctionResultData(this.farm.abi, 'earnedB', earnedBData)
        : ZERO;

      if (
        isZero(stakedAmountOfAddress) &&
        isZero(rewardAAmountOfAddress) &&
        isZero(rewardBAmountOfAddress)
      ) {
        return;
      }

      farm.rewardTokens = this._sortByRewardTokens(rewardTokens, [
        get(JSON.parse(data), 'rewardA'),
        get(JSON.parse(data), 'rewardB'),
      ]);

      const { rewardTokens: sortedRewardTokens } = farm;

      const targetStakeToken = stakeTokens[0];
      const targetRewardAToken = sortedRewardTokens[0];
      const targetRewardBToken = sortedRewardTokens[1];

      const stakeAmount = divideDecimals(
        stakedAmountOfAddress,
        targetStakeToken.decimals,
      );

      const rewardAAmount = divideDecimals(
        rewardAAmountOfAddress,
        targetRewardAToken.decimals,
      );

      const rewardBAmount = divideDecimals(
        rewardBAmountOfAddress,
        targetRewardBToken.decimals,
      );

      if (
        isZero(stakeAmount) &&
        isZero(rewardAAmount) &&
        isZero(rewardBAmount)
      ) {
        return;
      }

      farm.wallet = {
        stakeAmounts: [stakeAmount],
        rewardAmounts: [rewardAAmount, rewardBAmount],
      };

      output.push(farm);
    });

    return output;
  }

  private _formatFarm2Result(farmInfoZip: any) {
    const output = [];

    farmInfoZip.forEach(([farm, infoResult]) => {
      const { stakeTokens, rewardTokens } = farm;

      const [
        { success: balanceOfSuccess, returnData: balanceOfData },
        { success: earnedSuccess, returnData: earnedData },
      ] = infoResult;

      const stakedAmountOfAddress = validResult(balanceOfSuccess, balanceOfData)
        ? decodeFunctionResultData(this.farm2.abi, 'balanceOf', balanceOfData)
        : ZERO;

      const rewardAAmountOfAddress = validResult(earnedSuccess, earnedData)
        ? decodeFunctionResultData(this.farm2.abi, 'earned', earnedData)
        : ZERO;

      if (isZero(stakedAmountOfAddress) && isZero(rewardAAmountOfAddress)) {
        return;
      }

      const targetStakeToken = stakeTokens[0];
      const targetRewardToken = rewardTokens[0];

      const stakeAmount = divideDecimals(
        stakedAmountOfAddress,
        targetStakeToken.decimals,
      );

      const rewardAmount = divideDecimals(
        rewardAAmountOfAddress,
        targetRewardToken.decimals,
      );

      if (isZero(stakeAmount) && isZero(rewardAmount)) {
        return;
      }

      farm.wallet = {
        stakeAmounts: [stakeAmount],
        rewardAmounts: [rewardAmount],
      };

      output.push(farm);
    });

    return output;
  }

  private _sortByRewardTokens(tokens: Token[], sortByAddress: string[]) {
    return flat(
      sortByAddress.map((sort) =>
        tokens.filter(({ address }) => address === sort),
      ),
    );
  }
}
