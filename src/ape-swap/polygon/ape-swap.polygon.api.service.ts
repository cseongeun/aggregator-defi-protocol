import { Injectable } from '@nestjs/common';
import { Farm, Token } from '@seongeun/aggregator-base/lib/entity';
import { isUndefined } from '@seongeun/aggregator-util/lib/type';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@seongeun/aggregator-util/lib/encodeDecode';
import { getBatchStaticAggregator } from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import { get } from '@seongeun/aggregator-util/lib/object';
import {
  flat,
  toSplitWithChunkSize,
  zip,
} from '@seongeun/aggregator-util/lib/array';
import { ZERO } from '@seongeun/aggregator-util/lib/constant';
import { isZero } from '@seongeun/aggregator-util/lib/bignumber';
import { divideDecimals } from '@seongeun/aggregator-util/lib/decimals';
import { ApeSwapPolygonBase } from './ape-swap.polygon.base';
import { IUseFarm } from '../../defi-protocol.interface';
import { ProtocolFarmResponseDTO } from '../../defi-protocol.dto';

@Injectable()
export class ApeSwapPolygonApiService
  extends ApeSwapPolygonBase
  implements IUseFarm
{
  /**
   * 팜 조회
   * @param address 주소
   * @param farms 조회할 팜 리스트
   * @returns
   */
  async getFarmsByAddress(
    address: string,
    farms: Farm[],
  ): Promise<ProtocolFarmResponseDTO[]> {
    const [farmEncodedData, encodeSize] = this._encodeFarm(address, farms);

    const batchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      flat(farmEncodedData),
    );

    const farmResultZip = zip(
      farms,
      toSplitWithChunkSize(batchCall, encodeSize),
    );

    const farmResult = this._formatFarmResult(farmResultZip);

    return farmResult;
  }

  /**
   * 팜 인코딩 데이터
   * @param address 주소
   * @param farms 팜 리스트
   * @returns 스테이킹 및 리워드 수량 조회 데이터 인코딩, 인코딩 사이즈(묶음 사이즈)
   */
  private _encodeFarm(address: string, farms: Farm[]): [any, number] {
    const encodingData = farms.map(({ pid, data }) => {
      return [
        [
          this.farm.address,
          encodeFunction(this.farm.abi, 'userInfo', [pid, address]),
        ],
        [
          this.farm.address,
          encodeFunction(this.farm.abi, 'pendingBanana', [pid, address]),
        ],
        [
          get(data, 'rewarder'),
          encodeFunction(this.farmRewarder.abi, 'pendingTokens', [
            pid,
            address,
            0,
          ]),
        ],
      ];
    });
    return [encodingData, 3];
  }

  /**
   * 팜 디코딩 데이터 및 결과 포맷
   * @param farmInfoZip [[farm, farmResult], ...]
   * @returns [{ ...farm, portfolio }]
   */
  private async _formatFarmResult(
    farmResultZip: any,
  ): Promise<ProtocolFarmResponseDTO[]> {
    const output: ProtocolFarmResponseDTO[] = [];

    await Promise.all(
      farmResultZip.map(async ([farm, infoResult]) => {
        const { stakeTokens, rewardTokens, data } = farm;
        console.log(data);
        const rewarderRewardTokenAddress = get(
          data,
          'rewarderRewardTokenAddress',
        );

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
              'pendingBanana',
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
          rewarderRewardTokenAddress,
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

        const result = Object.assign(farm, {
          portfolio: {
            stakeAmounts: [stakeAmount.toString()],
            rewardAmounts: [
              rewardAmount.toString(),
              rewarderRewardAmount.toString(),
            ],
          },
        });

        output.push(result);
      }),
    );
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
