import { Injectable } from '@nestjs/common';
import { BigNumber } from 'ethers';
import { getBatchERC721TokenInfos } from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import { AirNFTBinanceSmartChainBase } from './air-nft.binance-smart-chain.base';

@Injectable()
export class AirNFTBinanceSmartChainSchedulerService extends AirNFTBinanceSmartChainBase {
  /***************************
   *  Public
   ***************************/
  async getNFTokenTotalSupply(): Promise<BigNumber> {
    return this.nfTokenContract.totalSupply();
  }

  async getNFTokenInfos(pids: number[]): Promise<
    {
      id: BigNumber;
      owner: string;
      tokenURI: string;
    }[]
  > {
    return getBatchERC721TokenInfos(
      this.provider,
      this.multiCallAddress,
      this.nfToken.address,
      pids,
    );
  }
}
