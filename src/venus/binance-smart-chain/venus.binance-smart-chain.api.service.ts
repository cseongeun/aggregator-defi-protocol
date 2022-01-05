import { Injectable } from '@nestjs/common';
import { Lending } from '@seongeun/aggregator-base/lib/entity';
import {
  flat,
  toSplitWithChunkSize,
  zip,
} from '@seongeun/aggregator-util/lib/array';
import {
  div,
  isZero,
  mul,
  toFixed,
} from '@seongeun/aggregator-util/lib/bignumber';
import { ZERO } from '@seongeun/aggregator-util/lib/constant';
import { divideDecimals } from '@seongeun/aggregator-util/lib/decimals';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@seongeun/aggregator-util/lib/encodeDecode';
import { getBatchStaticAggregator } from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import { isUndefined } from '@seongeun/aggregator-util/lib/type';
import { VenusBinanceSmartChainBase } from './venus.binance-smart-chain.base';

@Injectable()
export class VenusBinanceSmartChainApiService extends VenusBinanceSmartChainBase {
  /***************************
   *  FOR ADDRESS
   ***************************/
  async getLendingsByAddress(
    lendings: Lending[],
    address: string,
  ): Promise<any> {
    return this._trackingLendingsByAddress(lendings, address);
  }
  /***************************
   *  Private
   ***************************/
  private async _trackingLendingsByAddress(
    markets: Lending[],
    address: string,
  ) {
    if (isUndefined(markets)) return [];

    const addressAssets = await this.lendingContract.getAssetsIn(address);

    if (isZero(addressAssets.length)) return [];

    const userMarkets = markets.filter((market) =>
      addressAssets.includes(market.address),
    );

    const lendingInfoEncode = userMarkets.map(({ address: marketAddress }) => {
      return [
        [
          marketAddress,
          encodeFunction(this.vToken.abi, 'balanceOf', [address]),
        ],
        [marketAddress, encodeFunction(this.vToken.abi, 'exchangeRateStored')],
        [
          marketAddress,
          encodeFunction(this.vToken.abi, 'borrowBalanceStored', [address]),
        ],
      ];
    });

    const lendingInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      flat(lendingInfoEncode),
    );

    const lendingInfoBatchCallMap = toSplitWithChunkSize(
      lendingInfoBatchCall,
      3,
    );

    const lendingInfoZip = zip(userMarkets, lendingInfoBatchCallMap);

    return this._formatFarmResult(lendingInfoZip);
  }

  private _formatFarmResult(lendingInfoZip: any) {
    const output = [];

    lendingInfoZip.forEach(([market, result]) => {
      const {
        supplyToken: { decimals: supplyToken_decimals },
        borrowToken: { decimals: borrowToken_decimals },
      } = market;

      const [
        { success: balanceOfSuccess, returnData: balanceOfData },
        { success: exchangeRateSuccess, returnData: exchangeRateData },
        { success: borrowBalanceSuccess, returnData: borrowBalanceData },
      ] = result;

      const balanceOf = validResult(balanceOfSuccess, balanceOfData)
        ? decodeFunctionResultData(
            this.vToken.abi,
            'balanceOf',
            balanceOfData,
          )[0]
        : ZERO;

      const exchangeRate = validResult(exchangeRateSuccess, exchangeRateData)
        ? decodeFunctionResultData(
            this.vToken.abi,
            'exchangeRateStored',
            exchangeRateData,
          )[0]
        : ZERO;

      const borrowBalance = validResult(borrowBalanceSuccess, borrowBalanceData)
        ? decodeFunctionResultData(
            this.vToken.abi,
            'borrowBalanceStored',
            borrowBalanceData,
          )[0]
        : ZERO;

      const supplyAmount = divideDecimals(
        toFixed(div(mul(balanceOf, exchangeRate), 1e18), 0),
        supplyToken_decimals,
      );

      const borrowAmount = divideDecimals(borrowBalance, borrowToken_decimals);

      if (isZero(supplyAmount) && isZero(borrowAmount)) {
        return;
      }

      market.wallet = {
        supplyAmount: supplyAmount.toString(),
        borrowAmount: borrowAmount.toString(),
      };

      output.push(market);
    });

    return output;
  }
}
