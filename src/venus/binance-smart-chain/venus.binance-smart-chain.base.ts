import { Injectable } from '@nestjs/common';
import { Contract, ethers } from 'ethers';
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
import { INFO } from '../venus.constant';

@Injectable()
export class VenusBinanceSmartChainBase extends DeFiProtocolBase {
  name = PROTOCOL_NAME.VENUS;
  chainType = NETWORK_CHAIN_TYPE.EVM;
  chainId = NETWORK_CHAIN_ID.BINANCE_SMART_CHAIN;
  constants = INFO[NETWORK_CHAIN_ID.BINANCE_SMART_CHAIN];

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

  get lending(): IContractInfo {
    const name = this.constants.lending.name;
    const address = this.constants.lending.address;
    const abi = this.addressABI.get(address);
    return { name, address, abi };
  }

  get vToken(): IContractInfo {
    const address = this.constants.lending.v_token_sample_address;
    const abi = this.addressABI.get(address);
    return {
      address,
      abi,
    };
  }

  get lendingContract(): Contract {
    return new ethers.Contract(
      this.lending.address,
      this.lending.abi,
      this.provider,
    );
  }

  vTokenContract(address: string): Contract {
    return new ethers.Contract(address, this.vToken.abi, this.provider);
  }
}
