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
import { INFO } from '../quick-swap.constant';

@Injectable()
export class QuickSwapPolygonBase extends DeFiProtocolBase {
  name = PROTOCOL_NAME.QUICK_SWAP;
  chainType = NETWORK_CHAIN_TYPE.EVM;
  chainId = NETWORK_CHAIN_ID.POLYGON;
  constants = INFO[NETWORK_CHAIN_ID.POLYGON];

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

  get farm(): IContractInfo {
    const name = this.constants.farm.name;
    const address = this.constants.farm.sample_address;
    const abi = this.addressABI.get(address);
    return {
      name,
      address,
      abi,
    };
  }

  get farmFactory(): IContractInfo {
    const address = this.constants.farm.factory_address;
    const abi = this.addressABI.get(address);
    return { address, abi };
  }

  get farm2(): IContractInfo {
    const name = this.constants.farm2.name;
    const address = this.constants.farm2.sample_address;
    const abi = this.addressABI.get(address);
    return {
      name,
      address,
      abi,
    };
  }

  get farm2Factory(): IContractInfo {
    const address = this.constants.farm2.factory_address;
    const abi = this.addressABI.get(address);
    return {
      address,
      abi,
    };
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

  farmContract(address: string): Contract {
    return new ethers.Contract(address, this.farm.abi, this.provider);
  }

  get farmFactoryContract(): Contract {
    return new ethers.Contract(
      this.farmFactory.address,
      this.farmFactory.abi,
      this.provider,
    );
  }

  farm2Contract(address: string): Contract {
    return new ethers.Contract(address, this.farm2.abi, this.provider);
  }

  get farm2FactoryContract(): Contract {
    return new ethers.Contract(
      this.farm2Factory.address,
      this.farm2Factory.abi,
      this.provider,
    );
  }

  get dexFactoryContract(): Contract {
    return new ethers.Contract(
      this.dexFactory.address,
      this.dexFactory.abi,
      this.provider,
    );
  }
}
