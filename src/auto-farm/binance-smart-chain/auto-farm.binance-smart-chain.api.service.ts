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
import { ProtocolFarmResponseDTO } from '../../defi-protocol.dto';
import { IUseFarm } from '../../defi-protocol.interface';
import { AutoFarmBinanceSmartChainBase } from './auto-farm.binance-smart-chain.base';

@Injectable()
export class AutoFarmBinanceSmartChainApiService
  extends AutoFarmBinanceSmartChainBase
  implements IUseFarm
{
  async getFarmsByAddress(
    address: string,
    farms: Farm[],
  ): Promise<ProtocolFarmResponseDTO[]> {
    const [farmEncodeData, encodeSize] = this._encodeFarm(address, farms);

    const batchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      flat(farmEncodeData),
    );

    const farmResultZip = zip(
      farms,
      toSplitWithChunkSize(batchCall, encodeSize),
    );

    const farmResult = this._formatFarmResult(farmResultZip);

    return farmResult;
  }

  private _encodeFarm(address: string, farms: Farm[]): [any, number] {
    const encodingData = farms.map(({ pid }) => {
      return [
        [
          this.farm.address,
          encodeFunction(this.farm.abi, 'userInfo', [pid, address]),
        ],
        [
          this.farm.address,
          encodeFunction(this.farm.abi, 'pendingAUTO', [pid, address]),
        ],
      ];
    });
    return [encodingData, 2];
  }

  private _formatFarmResult(farmResultZip: any): ProtocolFarmResponseDTO[] {
    const output: ProtocolFarmResponseDTO[] = [];

    farmResultZip.forEach(([farm, infoResult]) => {
      const { stakeTokens, rewardTokens } = farm;

      const [
        { success: stakeAmountSuccess, returnData: stakeAmountData },
        { success: pendingRewardSuccess, returnData: pendingRewardData },
      ] = infoResult;

      const stakedAmountOfAddress = validResult(
        stakeAmountSuccess,
        stakeAmountData,
      )
        ? decodeFunctionResultData(this.farm.abi, 'userInfo', stakeAmountData)
            .shares
        : ZERO;

      const rewardAmountOfAddress = validResult(
        pendingRewardSuccess,
        pendingRewardData,
      )
        ? decodeFunctionResultData(
            this.farm.abi,
            'pendingAUTO',
            pendingRewardData,
          )
        : ZERO;

      if (isZero(stakedAmountOfAddress) && isZero(rewardAmountOfAddress)) {
        return;
      }

      const targetStakeToken = stakeTokens[0];
      const targetRewardToken = rewardTokens[0];

      const stakeAmount = divideDecimals(
        rewardAmountOfAddress,
        targetStakeToken.decimals,
      );

      const rewardAmount = divideDecimals(
        rewardAmountOfAddress,
        targetRewardToken.decimals,
      );

      console.log(stakeAmount.toString(), rewardAmount.toString());
      if (isZero(stakeAmount) && isZero(rewardAmount)) {
        return;
      }

      const result = Object.assign(farm, {
        portfolio: {
          stakeAmounts: [stakeAmount.toString()],
          rewardAmounts: [rewardAmount.toString()],
        },
      });

      output.push(result);
    });

    return output;
  }
}
