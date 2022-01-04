import { Injectable } from '@nestjs/common';
import { BigNumber } from 'ethers';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@seongeun/aggregator-util/lib/encodeDecode';
import { getBatchStaticAggregator } from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import { isNull } from '@seongeun/aggregator-util/lib/type';
import {
  flat,
  toSplitWithChunkSize,
  zip,
} from '@seongeun/aggregator-util/lib/array';
import { AaveAvalancheBase } from './aave.avalanche.base';

@Injectable()
export class AaveAvalancheSchedulerService extends AaveAvalancheBase {
  /***************************
   *  Public
   ***************************/
  async getLendingReserveList(): Promise<string[]> {
    return this.lendingContract.getReservesList();
  }

  async getLendingMarketInfos(reserves: string[]): Promise<
    {
      reserve: string;
      aTokenAddress: string;
      stableDebtTokenAddress: string;
      variableDebtTokenAddress: string;
      availableLiquidity: BigNumber;
      totalStableDebt: BigNumber;
      totalVariableDebt: BigNumber;
      liquidityRate: BigNumber;
      variableBorrowRate: BigNumber;
      stableBorrowRate: BigNumber;
      averageStableBorrowRate: BigNumber;
      liquidityIndex: BigNumber;
      variableBorrowIndex: BigNumber;
      lastUpdateTimestamp: number;
      decimals: BigNumber;
      ltv: BigNumber;
      liquidationThreshold: BigNumber;
      liquidationBonus: BigNumber;
      reserveFactor: BigNumber;
      usageAsCollateralEnabled: boolean;
      borrowingEnabled: boolean;
      stableBorrowRateEnabled: boolean;
      isActive: boolean;
      isFrozen: boolean;
    }[]
  > {
    const lendingMarketInfosEncode = this._getLendingMarketEncodeData(reserves);

    const lendingMarketInfosBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      flat(lendingMarketInfosEncode),
    );

    const lendingMarketInfosBatchCallMap = toSplitWithChunkSize(
      lendingMarketInfosBatchCall,
      3,
    );

    const lendingMarketInfosZip = zip(reserves, lendingMarketInfosBatchCallMap);

    return this._formatLendingMarketResult(lendingMarketInfosZip);
  }

  private _getLendingMarketEncodeData(reserves: string[]) {
    return reserves.map((address: string) => {
      return [
        [
          this.lendingDataProvider.address,
          encodeFunction(
            this.lendingDataProvider.abi,
            'getReserveTokensAddresses',
            [address],
          ),
        ],
        [
          this.lendingDataProvider.address,
          encodeFunction(this.lendingDataProvider.abi, 'getReserveData', [
            address,
          ]),
        ],
        [
          this.lendingDataProvider.address,
          encodeFunction(
            this.lendingDataProvider.abi,
            'getReserveConfigurationData',
            [address],
          ),
        ],
      ];
    });
  }

  private _formatLendingMarketResult(lendingMarketInfosZip: any) {
    return lendingMarketInfosZip.map(([reserve, lendingMarketInfoResult]) => {
      const [
        {
          success: reserveTokenAddressesSuccess,
          returnData: reserveTokenAddressesData,
        },
        { success: reserveDataSuccess, returnData: reserveDataData },
        {
          success: reserveConfigurationSuccess,
          returnData: reserveConfigurationData,
        },
      ] = lendingMarketInfoResult;

      const reserveTokenAddresses = validResult(
        reserveTokenAddressesSuccess,
        reserveTokenAddressesData,
      )
        ? decodeFunctionResultData(
            this.lendingDataProvider.abi,
            'getReserveTokensAddresses',
            reserveTokenAddressesData,
          )
        : null;

      const reserveData = validResult(reserveDataSuccess, reserveDataData)
        ? decodeFunctionResultData(
            this.lendingDataProvider.abi,
            'getReserveData',
            reserveDataData,
          )
        : null;

      const reserveConfig = validResult(
        reserveConfigurationSuccess,
        reserveConfigurationData,
      )
        ? decodeFunctionResultData(
            this.lendingDataProvider.abi,
            'getReserveConfigurationData',
            reserveConfigurationData,
          )
        : null;

      if (
        isNull(reserveTokenAddresses) ||
        isNull(reserveData) ||
        isNull(reserveConfig)
      ) {
        return null;
      }

      return {
        reserve,
        ...reserveTokenAddresses,
        ...reserveData,
        ...reserveConfig,
      };
    });
  }
}
