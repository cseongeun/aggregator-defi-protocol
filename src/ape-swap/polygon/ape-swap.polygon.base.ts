import { Injectable } from '@nestjs/common';
import { Contract, ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import {
  PROTOCOL_NAME,
  NETWORK_CHAIN_ID,
  NETWORK_CHAIN_TYPE,
} from '@seongeun/aggregator-base/lib/constant';
import {
  ContractService,
  NetworkService,
  ProtocolService,
} from '@seongeun/aggregator-base/lib/service';
import { IContractInfo } from '@seongeun/aggregator-base/lib/contract/contract.interface';
import { INFO } from '../ape-swap.constant';
import { DeFiProtocolBase } from '../../defi-protocol.base';

@Injectable()
export class ApeSwapPolygonBase extends DeFiProtocolBase {
  name = PROTOCOL_NAME.APE_SWAP;
  chainType = NETWORK_CHAIN_TYPE.EVM;
  chainId = NETWORK_CHAIN_ID.MATIC;
  constants = INFO[NETWORK_CHAIN_ID.MATIC];

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
    const address = this.constants.farm.address;
    const abi = this.addressABI.get(address);
    return {
      name,
      address,
      abi,
    };
  }

  get farmRewarder(): IContractInfo {
    const name = this.constants.farm_rewarder.name;
    const address = this.constants.farm_rewarder.sample_address;
    const abi = this.addressABI.get(address);
    return {
      name,
      address,
      abi,
    };
  }

  get farm2(): IContractInfo {
    const name = this.constants.farm2.name;
    const address = this.constants.farm2.address;
    const abi = this.addressABI.get(address);
    return {
      name,
      address,
      abi,
    };
  }

  get farm2Strat(): IContractInfo {
    const address = this.constants.farm2_strat.sample_address;
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

  get farmContract(): Contract {
    return new ethers.Contract(this.farm.address, this.farm.abi, this.provider);
  }

  farmRewarderContract(address: string): Contract {
    return new ethers.Contract(address, this.farmRewarder.abi, this.provider);
  }

  get farm2Contract(): Contract {
    return new ethers.Contract(
      this.farm2.address,
      this.farm2.abi,
      this.provider,
    );
  }

  farm2StratContract(address: string): Contract {
    return new ethers.Contract(address, this.farm2Strat.abi, this.provider);
  }

  get dexFactoryContract(): Contract {
    return new ethers.Contract(
      this.dexFactory.address,
      this.dexFactory.abi,
      this.provider,
    );
  }
}
