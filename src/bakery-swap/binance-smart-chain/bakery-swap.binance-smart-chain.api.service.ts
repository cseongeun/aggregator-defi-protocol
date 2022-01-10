import { Injectable } from '@nestjs/common';
import { Farm } from '@seongeun/aggregator-base/lib/entity';
import {
  flat,
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
import { BakerySwapBinanceSmartChainBase } from './bakery-swap.binance-smart-chain.base';

@Injectable()
export class BakerySwapBinanceSmartChainApiService extends BakerySwapBinanceSmartChainBase {
  /***************************
   *  FOR ADDRESS
   ***************************/
  async getFarmsByAddress(farms: Farm[], address: string): Promise<any> {
    return this._trackingFarmsByAddress(farms, address);
  }

  /***************************
   *  Private
   ***************************/
  private async _trackingFarmsByAddress(
    farms: Farm[],
    address: string,
  ): Promise<any> {
    if (isUndefined(farms)) return [];

    const farmInfoEncode = farms.map(({ data }) => {
      const lpToken = get(JSON.parse(data), 'lpToken');
      return [
        [
          this.farm.address,
          encodeFunction(this.farm.abi, 'poolUserInfoMap', [lpToken, address]),
        ],
        [
          this.farm.address,
          encodeFunction(this.farm.abi, 'pendingToken', [lpToken, address]),
        ],
      ];
    });

    const farmInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      flat(farmInfoEncode),
    );

    const farmInfoBatchCallMap = toSplitWithChunkSize(farmInfoBatchCall, 2);

    const farmInfoZip = zip(farms, farmInfoBatchCallMap);

    return this._formatFarmResult(farmInfoZip);
  }

  private _formatFarmResult(farmInfoZip: any) {
    const output = [];
    farmInfoZip.forEach(([farm, infoResult]) => {
      const { stakeTokens, rewardTokens } = farm;

      const [
        { success: stakeAmountSuccess, returnData: stakeAmountData },
        { success: pendingRewardSuccess, returnData: pendingRewardData },
      ] = infoResult;

      const stakedAmountOfAddress = validResult(
        stakeAmountSuccess,
        stakeAmountData,
      )
        ? decodeFunctionResultData(
            this.farm.abi,
            'poolUserInfoMap',
            stakeAmountData,
          ).amount
        : ZERO;

      const rewardAmountOfAddress = validResult(
        pendingRewardSuccess,
        pendingRewardData,
      )
        ? decodeFunctionResultData(
            this.farm.abi,
            'pendingToken',
            pendingRewardData,
          )
        : ZERO;

      if (isZero(stakedAmountOfAddress) && isZero(rewardAmountOfAddress)) {
        return;
      }

      const targetStakeToken = stakeTokens[0];
      const targetRewardToken = rewardTokens[0];

      const stakeAmount = divideDecimals(
        stakedAmountOfAddress,
        targetStakeToken.decimals,
      );

      const rewardAmount = divideDecimals(
        rewardAmountOfAddress,
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
}
