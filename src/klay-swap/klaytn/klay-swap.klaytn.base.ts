import { Injectable } from '@nestjs/common';
import { ethers, Contract } from 'ethers';
import { Provider } from '@ethersproject/providers';
import {
  NETWORK_CHAIN_ID,
  NETWORK_CHAIN_TYPE,
  PROTOCOL_NAME,
} from '@seongeun/aggregator-base/lib/constant';
import {
  ContractService,
  NetworkService,
  ProtocolService,
} from '@seongeun/aggregator-base/lib/service';
import { IContractInfo } from '@seongeun/aggregator-base/lib/interface';
import { DeFiProtocolBase } from '../../defi-protocol.base';
import { INFO } from '../klay-swap.constant';

@Injectable()
export class KlaySwapKlaytnBase extends DeFiProtocolBase {
  name = PROTOCOL_NAME.KLAY_SWAP;
  chainType = NETWORK_CHAIN_TYPE.EVM;
  chainId = NETWORK_CHAIN_ID.KLAYTN;
  constants = INFO[NETWORK_CHAIN_ID.KLAYTN];

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

  get dexFactory(): IContractInfo {
    const address = this.constants.dex.factory_address;
    const abi = this.addressABI.get(address);
    const initCodeHash = this.constants.dex.factory_init_code_hash;
    return {
      address,
      abi,
      initCodeHash,
    };
  }

  get dexFactoryContract(): Contract {
    const res = new ethers.Contract(
      this.dexFactory.address,
      this.dexFactory.abi,
      this.provider,
    );
    return res;
  }
}