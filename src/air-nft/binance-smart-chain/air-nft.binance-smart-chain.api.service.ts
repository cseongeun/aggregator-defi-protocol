import { Injectable } from '@nestjs/common';
import { Provider } from '@ethersproject/providers';
import { NFToken } from '@seongeun/aggregator-base/lib/entity';
import {
  getBatchStaticAggregator,
  getSafeERC721BalanceOf,
} from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import { AirNFTBinanceSmartChainBase } from './air-nft.binance-smart-chain.base';
import { isZero } from '@seongeun/aggregator-util/lib/bignumber';
import { fillSequenceNumber } from '@seongeun/aggregator-util/lib/array';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@seongeun/aggregator-util/lib/encodeDecode';

@Injectable()
export class AirNFTBinanceSmartChainApiService extends AirNFTBinanceSmartChainBase {
  /***************************
   *  FOR ADDRESS
   ***************************/
  async getNFTokensByAddress(address: string): Promise<NFToken[]> {
    return this._trackingNFTokensByAddress(address);
  }

  /***************************
   *  Private
   ***************************/
  private async _trackingNFTokensByAddress(address: string) {
    const output = [];

    await Promise.all(
      [[this.nfToken.address, this.nfToken.abi]].map(
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
