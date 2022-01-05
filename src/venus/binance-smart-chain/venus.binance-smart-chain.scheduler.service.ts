import { Injectable } from '@nestjs/common';
import { BigNumber } from 'ethers';
import { ZERO, ZERO_ADDRESS } from '@seongeun/aggregator-util/lib/constant';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@seongeun/aggregator-util/lib/encodeDecode';
import { getBatchStaticAggregator } from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import { VenusBinanceSmartChainBase } from './venus.binance-smart-chain.base';

@Injectable()
export class VenusBinanceSmartChainSchedulerService extends VenusBinanceSmartChainBase {
  /***************************
   *  Public
   ***************************/
  async getLendingAllMarkets(): Promise<string[]> {
    return this.lendingContract.getAllMarkets();
  }

  async getLendingMarketInfos(market: string): Promise<{
    underlying: string;
    supplyRatePerBlock: BigNumber;
    borrowRatePerBlock: BigNumber;
    decimals: number;
    totalBorrows: BigNumber;
    totalReserves: BigNumber;
    reserveFactorMantissa: BigNumber;
    market: {
      isListed: boolean;
      collateralFactorMantissa: BigNumber;
      isVenus: boolean;
    };
  }> {
    const marketInfoEncode = this._lendingMarketEncodeData(market);

    const marketInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      marketInfoEncode,
    );

    return this._lendingMarketResultData(marketInfoBatchCall);
  }

  private _lendingMarketEncodeData(market: string) {
    return [
      [market, encodeFunction(this.vToken.abi, 'underlying')],
      [market, encodeFunction(this.vToken.abi, 'supplyRatePerBlock')],
      [market, encodeFunction(this.vToken.abi, 'borrowRatePerBlock')],
      [market, encodeFunction(this.vToken.abi, 'decimals')],
      [market, encodeFunction(this.vToken.abi, 'totalBorrows')],
      [market, encodeFunction(this.vToken.abi, 'totalReserves')],
      [market, encodeFunction(this.vToken.abi, 'reserveFactorMantissa')],
      [
        this.lending.address,
        encodeFunction(this.lending.abi, 'markets', [market]),
      ],
    ];
  }

  private _lendingMarketResultData(lendingMarketInfo: any) {
    const [
      { success: underlyingSuccess, returnData: underlyingData },
      {
        success: supplyRatePerBlockSuccess,
        returnData: supplyRatePerBlockData,
      },
      {
        success: borrowRatePerBlockSuccess,
        returnData: borrowRatePerBlockData,
      },
      { success: decimalSuccess, returnData: decimalData },
      { success: totalBorrowSuccess, returnData: totalBorrowData },
      { success: totalReserveSuccess, returnData: totalReserveData },
      { success: reserveFactorSuccess, returnData: reserveFactorData },
      { success: marketSuccess, returnData: marketData },
    ] = lendingMarketInfo;

    return {
      underlying: validResult(underlyingSuccess, underlyingData)
        ? decodeFunctionResultData(
            this.vToken.abi,
            'underlying',
            underlyingData,
          )[0]
        : ZERO_ADDRESS,
      supplyRatePerBlock: validResult(
        supplyRatePerBlockSuccess,
        supplyRatePerBlockData,
      )
        ? decodeFunctionResultData(
            this.vToken.abi,
            'supplyRatePerBlock',
            supplyRatePerBlockData,
          )[0]
        : ZERO,
      borrowRatePerBlock: validResult(
        borrowRatePerBlockSuccess,
        borrowRatePerBlockData,
      )
        ? decodeFunctionResultData(
            this.vToken.abi,
            'borrowRatePerBlock',
            borrowRatePerBlockData,
          )[0]
        : ZERO,
      decimals: validResult(decimalSuccess, decimalData)
        ? decodeFunctionResultData(this.vToken.abi, 'decimals', decimalData)[0]
        : ZERO,
      totalBorrows: validResult(totalBorrowSuccess, totalBorrowData)
        ? decodeFunctionResultData(
            this.vToken.abi,
            'totalBorrows',
            totalBorrowData,
          )[0]
        : ZERO,
      totalReserves: validResult(totalReserveSuccess, totalReserveData)
        ? decodeFunctionResultData(
            this.vToken.abi,
            'totalReserves',
            totalReserveData,
          )[0]
        : ZERO,
      reserveFactorMantissa: validResult(
        reserveFactorSuccess,
        reserveFactorData,
      )
        ? decodeFunctionResultData(
            this.vToken.abi,
            'reserveFactorMantissa',
            reserveFactorData,
          )[0]
        : ZERO,
      market: validResult(marketSuccess, marketData)
        ? decodeFunctionResultData(this.lending.abi, 'markets', marketData)
        : null,
    };
  }
}
