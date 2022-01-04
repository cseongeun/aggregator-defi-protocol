import { Injectable } from '@nestjs/common';
import { Lending } from '@seongeun/aggregator-base/lib/entity';
import { isZero } from '@seongeun/aggregator-util/lib/bignumber';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@seongeun/aggregator-util/lib/encodeDecode';
import { getBatchStaticAggregator } from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import { isNull, isUndefined } from '@seongeun/aggregator-util/lib/type';
import { zip } from '@seongeun/aggregator-util/lib/array';
import { get } from '@seongeun/aggregator-util/lib/object';
import { divideDecimals } from '@seongeun/aggregator-util/lib/decimals';
import { AaveAvalancheBase } from './aave.avalanche.base';

@Injectable()
export class AaveAvalancheApiService extends AaveAvalancheBase {
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
    const output = [];

    if (isUndefined(markets)) return output;

    const lendingInfoEncode = markets.map(({ data }) => {
      const reserve = get(JSON.parse(data), 'reserve');

      return [
        this.lendingDataProvider.address,
        encodeFunction(this.lendingDataProvider.abi, 'getUserReserveData', [
          reserve,
          address,
        ]),
      ];
    });

    const lendingInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      lendingInfoEncode,
    );

    const lendingInfoZip = zip(markets, lendingInfoBatchCall);

    lendingInfoZip.forEach((zip) => {
      const [market, result] = zip;

      const { data } = market;

      const [aTokenDecimals, vTokenDecimals] = [
        get(JSON.parse(data), 'aTokenDecimals'),
        get(JSON.parse(data), 'vTokenDecimals'),
      ];

      const {
        success: userReserveDataSuccess,
        returnData: userReserveDataData,
      } = result;

      const userReserve = validResult(
        userReserveDataSuccess,
        userReserveDataData,
      )
        ? decodeFunctionResultData(
            this.lendingDataProvider.abi,
            'getUserReserveData',
            userReserveDataData,
          )
        : null;

      if (isNull(userReserve)) {
        return;
      }

      const { currentATokenBalance, currentVariableDebt } = userReserve;

      const supplyAmount = divideDecimals(currentATokenBalance, aTokenDecimals);
      const borrowAmount = divideDecimals(currentVariableDebt, vTokenDecimals);

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
