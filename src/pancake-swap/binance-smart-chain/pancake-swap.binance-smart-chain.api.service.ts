import { Injectable } from '@nestjs/common';
import { Provider } from '@ethersproject/providers';
import { Farm, NFToken } from '@seongeun/aggregator-base/lib/entity';
import {
  fillSequenceNumber,
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
import {
  getBatchStaticAggregator,
  getSafeERC721BalanceOf,
} from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import { PancakeSwapBinanceSmartChainBase } from './pancake-swap.binance-smart-chain.base';
import { IUseFarm, IUseNFT } from '../../defi-protocol.interface';
import { ProtocolFarmResponseDTO } from '../../defi-protocol.dto';

@Injectable()
export class PancakeSwapBinanceSmartChainApiService
  extends PancakeSwapBinanceSmartChainBase
  implements IUseFarm, IUseNFT
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
    const farmGrouped = groupBy(farms, 'name');

    const farm1 = farmGrouped[this.farm.name];
    const farm2 = farmGrouped[this.farm2.name];

    const [farmEncodedData, encodeSize] = this._encodeFarm(address, farm1);
    const [farm2EncodedData, encodeSize2] = this._encodeFarm2(address, farm2);

    const encodedData = farmEncodedData.concat(farm2EncodedData);

    const batchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      flat(encodedData),
    );

    const [farmResultZip, farm2ResultZip] = [
      zip(
        farm1,
        toSplitWithChunkSize(
          batchCall.slice(0, farm1.length * encodeSize),
          encodeSize,
        ),
      ),
      zip(
        farm2,
        toSplitWithChunkSize(
          batchCall.slice(farm1.length * encodeSize),
          encodeSize2,
        ),
      ),
    ];

    const farmResult = this._formatFarmResult(farmResultZip);
    const farm2Result = this._formatFarm2Result(farm2ResultZip);

    return farmResult.concat(farm2Result);
  }

  /**
   * 팜 인코딩
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
          encodeFunction(this.farm.abi, 'pendingCake', [pid, address]),
        ],
      ];
    });
    return [encodingData, 2];
  }

  /**
   * 팜2 인코딩 데이터
   * @param address 주소
   * @param farms 팜2 리스트
   * @returns 스테이킹 및 리워드 수량 조회 데이터 인코딩, 인코딩 사이즈(묶음 사이즈)
   */
  private _encodeFarm2(address: string, farms: Farm[]): [any, number] {
    const encodingData = farms.map(({ address: farmAddress }) => {
      return [
        [farmAddress, encodeFunction(this.farm2.abi, 'userInfo', [address])],
        [
          farmAddress,
          encodeFunction(this.farm2.abi, 'pendingReward', [address]),
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

    farmResultZip.forEach(
      ([farm, infoResult]: [farm: Farm, infoResult: any]) => {
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
              'pendingCake',
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

        const result = Object.assign(farm, {
          portfolio: {
            stakeAmounts: [stakeAmount.toString()],
            rewardAmounts: [rewardAmount.toString()],
          },
        });

        output.push(result);
      },
    );

    return output;
  }

  /**
   * 팜2 디코딩 데이터 및 결과 포맷
   * @param farmInfoZip [[farm, farmResult], ...]
   * @returns [{ ...farm, portfolio }]
   */
  private _formatFarm2Result(farmResultZip: any): ProtocolFarmResponseDTO[] {
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
        ? decodeFunctionResultData(this.farm2.abi, 'userInfo', stakeAmountData)
            .amount
        : ZERO;

      const rewardAmountOfAddress = validResult(
        pendingRewardSuccess,
        pendingRewardData,
      )
        ? decodeFunctionResultData(
            this.farm2.abi,
            'pendingReward',
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

  async getNFTokensByAddress(
    address: string,
    nfts: NFToken[],
  ): Promise<{ indexes: number[]; nfTokenAddress: string }[]> {
    const output = [];

    await Promise.all(
      [
        [this.nfToken.address, this.nfToken.abi],
        [this.nfToken2.address, this.nfToken2.abi],
        [this.nfToken3.address, this.nfToken3.abi],
        [this.nfToken4.address, this.nfToken4.abi],
        [this.nfToken5.address, this.nfToken5.abi],
      ].map(
        async ([nfTokenAddress, nfTokenAbi]: [
          nfTokenAddress: string,
          nfTokenAbi: any,
        ]) => {
          const indexes = await this._getNFTokenIndexesByAddress(
            address,
            { address: nfTokenAddress, abi: nfTokenAbi },
            {
              provider: this.provider,
              multiCallAddress: this.multiCallAddress,
            },
          );

          if (indexes.length > 0) {
            output.push({ indexes, nfTokenAddress });
          }
        },
      ),
    );
    return output;
  }

  private async _getNFTokenIndexesByAddress(
    address: string,
    nfTokenExtra: {
      address: string;
      abi: any;
    },
    networkExtra: {
      provider: Provider;
      multiCallAddress: string;
    },
  ): Promise<number[]> {
    const output = [];

    const balanceOf = await getSafeERC721BalanceOf(
      networkExtra.provider,
      networkExtra.multiCallAddress,
      nfTokenExtra.address,
      address,
    );

    if (isZero(balanceOf)) return output;

    const tokenOfOwnerByIndexEncode = fillSequenceNumber(balanceOf).map(
      (index: number) => [
        nfTokenExtra.address,
        encodeFunction(nfTokenExtra.abi, 'tokenOfOwnerByIndex', [
          address,
          index,
        ]),
      ],
    );

    const tokenOfOwnerByIndexBatchCall = await getBatchStaticAggregator(
      networkExtra.provider,
      networkExtra.multiCallAddress,
      tokenOfOwnerByIndexEncode,
    );

    tokenOfOwnerByIndexBatchCall.forEach(({ success, returnData }) => {
      if (validResult(success, returnData)) {
        const index = decodeFunctionResultData(
          nfTokenExtra.abi,
          'tokenOfOwnerByIndex',
          returnData,
        )[0];
        output.push(Number(index.toString()));
      }
    });

    return output;
  }
}
