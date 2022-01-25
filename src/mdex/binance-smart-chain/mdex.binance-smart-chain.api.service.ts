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
import { MdexBinanceSmartChainBase } from './mdex.binance-smart-chain.base';

@Injectable()
export class MdexBinanceSmartChainApiService
  extends MdexBinanceSmartChainBase
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

  /**
   * 팜 인코딩 데이터
   * @param address 주소
   * @param farms 팜 리스트
   * @returns 스테이킹 및 리워드 수량 조회 데이터 인코딩, 인코딩 사이즈(묶음 사이즈)
   */
  private _encodeFarm(address: string, farms: Farm[]): [any, number] {
    const encodingData = farms.map(({ pid }) => {
      return [
        [
          this.farm.address,
          encodeFunction(this.farm.abi, 'userInfo', [pid, address]),
        ],
        [
          this.farm.address,
          encodeFunction(this.farm.abi, 'pending', [pid, address]),
        ],
      ];
    });

    return [encodingData, 2];
  }

  /**
   * 팜 디코딩 데이터 및 결과 포맷
   * @param farmInfoZip [[farm, farmResult], ...]
   * @returns [{ ...farm, portfolio }]
   */
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
            .amount
        : ZERO;

      const rewardAmountOfAddress = validResult(
        pendingRewardSuccess,
        pendingRewardData,
      )
        ? decodeFunctionResultData(
            this.farm.abi,
            'pending',
            pendingRewardData,
          )[0]
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
