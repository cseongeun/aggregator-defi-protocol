import { Injectable } from '@nestjs/common';
import { Contract, ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { IContractInfo } from '@seongeun/aggregator-base/lib/interface';
import {
  NetworkService,
  ContractService,
  ProtocolService,
} from '@seongeun/aggregator-base/lib/service';
import {
  NETWORK_CHAIN_ID,
  NETWORK_CHAIN_TYPE,
  PROTOCOL_NAME,
} from '@seongeun/aggregator-base/lib/constant';
import { INFO } from '../air-nft.constant';
import { DeFiProtocolBase } from '../../defi-protocol.base';

@Injectable()
export abstract class AirNFTBinanceSmartChainBase extends DeFiProtocolBase {
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
}
