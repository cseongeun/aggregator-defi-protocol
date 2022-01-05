import { Injectable } from '@nestjs/common';
import { Provider } from '@ethersproject/providers';
import { Farm } from '@seongeun/aggregator-base/lib/entity';
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
import { isUndefined } from '@seongeun/aggregator-util/lib/type';
import { PancakeSwapBinanceSmartChainBase } from './pancake-swap.binance-smart-chain.base';

@Injectable()
export class PancakeSwapBinanceSmartChainApiService extends PancakeSwapBinanceSmartChainBase {
  /***************************
   *  FOR ADDRESS
   ***************************/
  async getFarmsByAddress(farms: Farm[], address: string): Promise<any> {
    const farmGrouped = groupBy(farms, 'name');

    const [farmWalletInfo, farm2WalletInfo] = await Promise.all([
      this._trackingFarmsByAddress(farmGrouped[this.farm.name], address),
      this._trackingFarms2ByAddress(farmGrouped[this.farm2.name], address),
    ]);

    return farmWalletInfo.concat(farm2WalletInfo);
  }

  async getNFTokensByAddress(
    address: string,
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

  /***************************
   *  Private
   ***************************/
  private async _trackingFarmsByAddress(farms: Farm[], address: string) {
    if (isUndefined(farms)) return [];

    const farmInfoEncode = farms.map(({ pid }) => {
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

    const farmInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      flat(farmInfoEncode),
    );

    const farmInfoBatchCallMap: any[] = toSplitWithChunkSize(
      farmInfoBatchCall,
      2,
    );

    const farmInfoZip = zip(farms, farmInfoBatchCallMap);

    return this._formatFarmResult(farmInfoZip);
  }

  private async _trackingFarms2ByAddress(farms: Farm[], address: string) {
    if (isUndefined(farms)) return [];

    const farmInfoEncode = farms.map(({ address: farmAddress }) => {
      return [
        [farmAddress, encodeFunction(this.farm2.abi, 'userInfo', [address])],
        [
          farmAddress,
          encodeFunction(this.farm2.abi, 'pendingReward', [address]),
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
      2,
    );

    const farmInfoZip = zip(farms, farmInfoBatchCallMap);

    return this._formatFarm2Result(farmInfoZip);
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

      farm.wallet = {
        stakeAmounts: [stakeAmount],
        rewardAmounts: [rewardAmount],
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

      farm.wallet = {
        stakeAmounts: [stakeAmount],
        rewardAmounts: [rewardAmount],
      };

      output.push(farm);
    });
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
