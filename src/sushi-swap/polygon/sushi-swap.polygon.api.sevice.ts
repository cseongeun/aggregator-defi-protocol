import { Injectable } from '@nestjs/common';
import { Farm, Token } from '@seongeun/aggregator-base/lib/entity';
import { isUndefined } from '@seongeun/aggregator-util/lib/type';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@seongeun/aggregator-util/lib/encodeDecode';
import { get } from '@seongeun/aggregator-util/lib/object';
import { getBatchStaticAggregator } from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import {
  flat,
  toSplitWithChunkSize,
  zip,
} from '@seongeun/aggregator-util/lib/array';
import { ZERO } from '@seongeun/aggregator-util/lib/constant';
import { isZero } from '@seongeun/aggregator-util/lib/bignumber';
import { divideDecimals } from '@seongeun/aggregator-util/lib/decimals';
import { SushiSwapPolygonBase } from './sushi-swap.polygon.base';

@Injectable()
export class SushiSwapPolygonApiService extends SushiSwapPolygonBase {
  /***************************
   *  FOR ADDRESS
   ***************************/
  async getFarmsByAddress(farms: Farm[], address: string): Promise<any> {
    return this._trackingFarmsByAddress(farms, address);
  }

  // TODO: Change
  getFarmRewarderRewardToken(): string {
    return '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';
  }
  /***************************
   *  Private
   ***************************/
  private async _trackingFarmsByAddress(farms: Farm[], address: string) {
    if (isUndefined(farms)) return [];

    const farmInfoEncode = farms.map(({ pid, data }) => {
      return [
        [
          this.farm.address,
          encodeFunction(this.farm.abi, 'userInfo', [pid, address]),
        ],
        [
          this.farm.address,
          encodeFunction(this.farm.abi, 'pendingSushi', [pid, address]),
        ],
        [
          get(JSON.parse(data), 'rewarder'),
          encodeFunction(this.farmRewarder.abi, 'pendingTokens', [
            pid,
            address,
            0,
          ]),
        ],
      ];
    });

    const farmInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      flat(farmInfoEncode),
    );

    const farmInfoBatchCallMap: any[] = toSplitWithChunkSize(
      farmInfoBatchCall,
      3,
    );

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
        {
          success: rewarderPendingRewardSuccess,
          returnData: rewarderPendingRewardData,
        },
      ] = infoResult;

      const stakedAmountOfAddress = validResult(
        stakeAmountSuccess,
        stakeAmountData,
      )
        ? decodeFunctionResultData(this.farm.abi, 'userInfo', stakeAmountData)
            .amount
        : ZERO;

      const rewardAmountOfAddress = validResult(
        pendingRewardSuccess,
        pendingRewardData,
      )
        ? decodeFunctionResultData(
            this.farm.abi,
            'pendingSushi',
            pendingRewardData,
          )
        : ZERO;

      const rewarderRewardAmountOfAddress = validResult(
        rewarderPendingRewardSuccess,
        rewarderPendingRewardData,
      )
        ? decodeFunctionResultData(
            this.farmRewarder.abi,
            'pendingTokens',
            rewarderPendingRewardData,
          ).rewardAmounts
        : ZERO;

      if (
        isZero(stakedAmountOfAddress) &&
        isZero(rewardAmountOfAddress) &&
        isZero(rewarderRewardAmountOfAddress)
      ) {
        return;
      }

      farm.rewardTokens = this._sortByRewardTokens(rewardTokens, [
        this.token.address,
        this.getFarmRewarderRewardToken(),
      ]);

      const { rewardTokens: sortedRewardTokens } = farm;

      const targetStakeToken = stakeTokens[0];
      const targetRewardToken = sortedRewardTokens[0];
      const targetRewarderRewardToken = sortedRewardTokens[1];

      const stakeAmount = divideDecimals(
        stakedAmountOfAddress,
        targetStakeToken.decimals,
      );

      const rewardAmount = divideDecimals(
        rewardAmountOfAddress,
        targetRewardToken.decimals,
      );

      const rewarderRewardAmount = divideDecimals(
        rewarderRewardAmountOfAddress,
        targetRewarderRewardToken.decimals,
      );

      if (
        isZero(stakeAmount) &&
        isZero(rewardAmount) &&
        isZero(rewarderRewardAmount)
      ) {
        return;
      }

      farm.wallet = {
        stakeAmounts: [stakeAmount],
        rewardAmounts: [rewardAmount, rewarderRewardAmount],
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
