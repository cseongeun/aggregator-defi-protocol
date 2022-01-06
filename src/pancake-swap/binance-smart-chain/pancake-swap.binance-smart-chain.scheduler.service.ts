import { Injectable } from '@nestjs/common';
import { BigNumber } from 'ethers';
import axios from 'axios';
import { PancakeSwapBinanceSmartChainBase } from './pancake-swap.binance-smart-chain.base';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@seongeun/aggregator-util/lib/encodeDecode';
import {
  getBatchERC721TokenInfos,
  getBatchStaticAggregator,
} from '@seongeun/aggregator-util/lib/multicall/evm-contract';

@Injectable()
export class PancakeSwapBinanceSmartChainSchedulerService extends PancakeSwapBinanceSmartChainBase {
  /***************************
   *  Public
   ***************************/
  async getFarmTotalLength(): Promise<BigNumber> {
    return this.farmContract.poolLength();
  }

  async getFarmTotalAllocPoint(): Promise<BigNumber> {
    return this.farmContract.totalAllocPoint();
  }

  async getFarmRewardPerBlock(): Promise<BigNumber> {
    return this.farmContract.cakePerBlock();
  }

  async getFarmInfos(pids: number[]): Promise<
    {
      lpToken: string;
      allocPoint: BigNumber;
      lastRewardBlock: BigNumber;
      accCakePerShare: BigNumber;
    }[]
  > {
    const farmInfoEncode = pids.map((pid: number) => [
      this.farm.address,
      encodeFunction(this.farm.abi, 'poolInfo', [pid]),
    ]);

    const farmInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      farmInfoEncode,
    );

    return farmInfoBatchCall.map(({ success, returnData }) => {
      return validResult(success, returnData)
        ? decodeFunctionResultData(this.farm.abi, 'poolInfo', returnData)
        : null;
    });
  }

  async getFarm2TotalLength(): Promise<number> {
    const result: any = await axios.post(this.farm2.subGraphUrl, {
      query: `
        query smartChefFactory($smartChefAddress: String) {
          factory(id: $smartChefAddress) {
            totalSmartChef
          }
        }
      `,
      variables: {
        smartChefAddress: this.farm2.factoryAddress.toLowerCase(),
      },
    });
    return result?.data?.data?.factory?.totalSmartChef;
  }

  async getFarm2Infos(totalLength: number): Promise<
    {
      id: string;
      reward: string;
      startBlock: string;
      endBlock: string;
      stakeToken: {
        id: string;
        name: string;
        decimals: string;
        symbol: string;
      };
      earnToken: {
        id: string;
        name: string;
        decimals: string;
        symbol: string;
      };
    }[]
  > {
    const result: any = await axios.post(this.farm2.subGraphUrl, {
      query: `query smartChefs($limit: Int!) {
        smartChefs(first: $limit) {
          id
          reward
          startBlock
          endBlock
          stakeToken {
            id
            name
            symbol
            decimals
          }
          earnToken {
            id
            name
            symbol
            decimals
          }
       
        }
      }`,
      variables: {
        limit: Number(totalLength),
      },
    });
    return result?.data?.data.smartChefs;
  }

  // 유동 풀 총 갯수
  async getDexFactoryTotalLength(): Promise<BigNumber> {
    return this.dexFactoryContract.allPairsLength();
  }

  // 유동 풀 정보
  async getDexFactoryInfos(pids: number[]): Promise<string[]> {
    const dexFactoryInfoEncode = pids.map((pid: number) => [
      this.dexFactory.address,
      encodeFunction(this.dexFactory.abi, 'allPairs', [pid]),
    ]);

    const dexFactoryInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      dexFactoryInfoEncode,
    );

    return dexFactoryInfoBatchCall.map(({ success, returnData }) => {
      return validResult(success, returnData)
        ? decodeFunctionResultData(
            this.dexFactory.abi,
            'allPairs',
            returnData,
          )[0]
        : [];
    });
  }

  async getNFTokenTotalSupply(): Promise<BigNumber> {
    return this.nfTokenContract.totalSupply();
  }

  async getNFToken2TotalSupply(): Promise<BigNumber> {
    return this.nfToken2Contract.totalSupply();
  }

  async getNFToken3TotalSupply(): Promise<BigNumber> {
    return this.nfToken3Contract.totalSupply();
  }

  async getNFToken4TotalSupply(): Promise<BigNumber> {
    return this.nfToken4Contract.totalSupply();
  }

  async getNFToken5TotalSupply(): Promise<BigNumber> {
    return this.nfToken5Contract.totalSupply();
  }

  async getNFTokenInfos(
    pids: number[],
  ): Promise<{ id: BigNumber; owner: string; tokenURI: string }[]> {
    return getBatchERC721TokenInfos(
      this.provider,
      this.multiCallAddress,
      this.nfToken.address,
      pids,
    );
  }

  async getNFToken2Infos(
    pids: number[],
  ): Promise<{ id: BigNumber; owner: string; tokenURI: string }[]> {
    return getBatchERC721TokenInfos(
      this.provider,
      this.multiCallAddress,
      this.nfToken2.address,
      pids,
    );
  }

  async getNFToken3Infos(
    pids: number[],
  ): Promise<{ id: BigNumber; owner: string; tokenURI: string }[]> {
    return getBatchERC721TokenInfos(
      this.provider,
      this.multiCallAddress,
      this.nfToken3.address,
      pids,
    );
  }

  async getNFToken4Infos(
    pids: number[],
  ): Promise<{ id: BigNumber; owner: string; tokenURI: string }[]> {
    return getBatchERC721TokenInfos(
      this.provider,
      this.multiCallAddress,
      this.nfToken4.address,
      pids,
    );
  }

  async getNFToken5Infos(
    pids: number[],
  ): Promise<{ id: BigNumber; owner: string; tokenURI: string }[]> {
    return getBatchERC721TokenInfos(
      this.provider,
      this.multiCallAddress,
      this.nfToken5.address,
      pids,
    );
  }
}
