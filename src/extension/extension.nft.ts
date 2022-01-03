import { BigNumber, Contract } from 'ethers';
import { Constructor } from '@seongeun/aggregator-util/lib/constructor';
import { Provider } from '@ethersproject/providers';
import {
  getBatchStaticAggregator,
  getSafeERC721BalanceOf,
} from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import { isZero } from '@seongeun/aggregator-util/lib/bignumber';
import { fillSequenceNumber } from '@seongeun/aggregator-util/lib/array';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@seongeun/aggregator-util/lib/encodeDecode';

export function NFTExtension<T extends Constructor>(C: T) {
  abstract class Base extends C {
    constructor(...args: any[]) {
      super(...args);
    }

    /**
     * 유저의 NFT 정보 조회
     * @param walletAddress 유저 주소
     * @param params nf token search query params
     */
    abstract getNFTokensByAddress(walletAddress: string): Promise<any>;

    /**
     * NF 토큰 총 발행량
     */
    abstract getNFTokenTotalSupply(): Promise<BigNumber>;

    /**
     * NF 토큰 정보 조회
     * @param pids pid에 등록된 NFT 토큰 정보
     */
    abstract getNFTokenInfos(pids: number[]): Promise<
      {
        id: BigNumber;
        owner: string;
        tokenURI: string;
      }[]
    >;

    async getNFTokenIndexesByAddress(
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
  return Base;
}
