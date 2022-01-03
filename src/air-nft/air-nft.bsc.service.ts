import { Injectable } from '@nestjs/common';
import { BigNumber, Contract, ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { getBatchERC721TokenInfos } from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import {
  NetworkService,
  ContractService,
  ProtocolService,
} from '@seongeun/aggregator-base/lib/service';
import { NFToken } from '@seongeun/aggregator-base/lib/entity';
import {
  NETWORK_CHAIN_ID,
  NETWORK_CHAIN_TYPE,
  PROTOCOL_NAME,
} from '@seongeun/aggregator-base/lib/constant';
import { BaseExtension } from '../extension/extension.base';
import { NFTExtension } from '../extension/extension.nft';
import { INFO } from './air-nft.constant';
import { IContractInfo } from '@seongeun/aggregator-base/lib/interface';

@Injectable()
export class AirNFTBSCService extends NFTExtension(BaseExtension) {
  name = PROTOCOL_NAME.AIR_NFT;
  chainType = NETWORK_CHAIN_TYPE.EVM;
  chainId = NETWORK_CHAIN_ID.BSC;
  constants = INFO[NETWORK_CHAIN_ID.BSC];

  constructor(
    public readonly networkService: NetworkService,
    public readonly protocolService: ProtocolService,
    public readonly contractService: ContractService,
  ) {
    super(networkService, protocolService, contractService);
  }

  /***************************
   *  FOR ADDRESS
   ***************************/
  async getNFTokensByAddress(address: string): Promise<NFToken[]> {
    return this._trackingNFTokensByAddress(address);
  }

  /***************************
   *  ACCESSOR
   ***************************/
  get provider(): Provider {
    return super.provider as Provider;
  }

  get nfToken(): IContractInfo {
    const address = this.constants.nf_token.address;
    const abi = this.addressABI.get(address);
    return {
      address,
      abi,
    };
  }

  get nfTokenContract(): Contract {
    return new ethers.Contract(
      this.nfToken.address,
      this.nfToken.abi,
      this.provider,
    );
  }

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
          const indexes = await this.getNFTokenIndexesByAddress(
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
}
