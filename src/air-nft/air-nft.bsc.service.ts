import { Injectable } from '@nestjs/common';
import { BigNumber, Contract, ethers } from 'ethers';
import { DeFiBase } from '../defi-base';
import { DeFiNFT } from '../defi-nft';
import { INFO } from './air-nft.constant';
import { getBatchERC721TokenInfos } from '@libs/helper/batch-contract';
import { CHAIN_ID, PROTOCOL } from '@libs/helper/blockchain';
import { NetworkService } from '../../network/network.service';
import { AbiService } from '../../abi/abi.service';
import { ProtocolService } from '../../protocol/protocol.service';
import { TokenService } from '../../token/token.service';
import { NFToken } from '@libs/repository/nf-token/entity';
import { Provider } from '@ethersproject/providers';
import { CHAIN_TYPE } from '../../../libs/repository/src/network/constant';

@Injectable()
export class AirNFTBSCService extends DeFiNFT(DeFiBase) {
  name = PROTOCOL.AIR_NFT;
  chainType = CHAIN_TYPE.EVM;
  chainId = CHAIN_ID.BSC;
  constants = INFO[CHAIN_ID.BSC];

  constructor(
    public readonly networkService: NetworkService,
    public readonly protocolService: ProtocolService,
    public readonly tokenService: TokenService,
    public readonly abiService: AbiService,
  ) {
    super(networkService, protocolService, tokenService, abiService);
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

  get nfTokenAddress(): string {
    return this.constants.nf_token.address;
  }

  get nfTokenAbi(): any[] {
    return this.addressABI.get(this.nfTokenAddress);
  }

  get nfTokenContract(): Contract {
    return new ethers.Contract(this.nfTokenAddress, this.nfTokenAbi, this.provider);
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
      this.nfTokenAddress,
      pids,
    );
  }

  /***************************
   *  Private
   ***************************/
  private async _trackingNFTokensByAddress(address: string) {
    const output = [];

    await Promise.all(
      [[this.nfTokenAddress, this.nfTokenAbi]].map(
        async ([nfTokenAddress, nfTokenAbi]: [nfTokenAddress: string, nfTokenAbi: any]) => {
          const indexes = await this.getNFTokenIndexesByAddress(
            address,
            { address: nfTokenAddress, abi: nfTokenAbi },
            { provider: this.provider, multiCallAddress: this.multiCallAddress },
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
