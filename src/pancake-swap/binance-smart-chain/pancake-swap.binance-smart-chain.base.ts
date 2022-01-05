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
import { INFO } from '../pancake-swap.constant';

@Injectable()
export class PancakeSwapBinanceSmartChainBase extends DeFiProtocolBase {
  name = PROTOCOL_NAME.PANCAKE_SWAP;
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

  get farm2(): IContractInfo {
    const name = this.constants.farm2.name;
    const factoryAddress = this.constants.farm2.factory_address;
    const address = this.constants.farm2.sample_address;
    const subGraphUrl = this.constants.farm2.sub_graph_url;
    const abi = this.addressABI.get(address);
    return {
      name,
      address,
      abi,
      factoryAddress,
      subGraphUrl,
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

  get nfToken(): IContractInfo {
    const name = this.constants.nf_token.name;
    const address = this.constants.nf_token.address;
    const abi = this.addressABI.get(address);
    return {
      name,
      address,
      abi,
    };
  }

  get nfToken2(): IContractInfo {
    const name = this.constants.nf_token2.name;
    const address = this.constants.nf_token2.address;
    const abi = this.addressABI.get(address);
    return {
      name,
      address,
      abi,
    };
  }

  get nfToken3(): IContractInfo {
    const name = this.constants.nf_token3.name;
    const address = this.constants.nf_token3.address;
    const abi = this.addressABI.get(address);
    return {
      name,
      address,
      abi,
    };
  }

  get nfToken4(): IContractInfo {
    const name = this.constants.nf_token4.name;
    const address = this.constants.nf_token4.address;
    const abi = this.addressABI.get(address);
    return {
      name,
      address,
      abi,
    };
  }

  get nfToken5(): IContractInfo {
    const name = this.constants.nf_token5.name;
    const address = this.constants.nf_token5.address;
    const abi = this.addressABI.get(address);
    return {
      name,
      address,
      abi,
    };
  }

  get farmContract(): Contract {
    return new ethers.Contract(this.farm.address, this.farm.abi, this.provider);
  }

  farm2Contract(address: string): Contract {
    return new ethers.Contract(address, this.farm2.abi, this.provider);
  }

  get dexFactoryContract(): Contract {
    const res = new ethers.Contract(
      this.dexFactory.address,
      this.dexFactory.abi,
      this.provider,
    );
    return res;
  }

  get nfTokenContract(): Contract {
    return new ethers.Contract(
      this.nfToken.address,
      this.nfToken.abi,
      this.provider,
    );
  }

  get nfToken2Contract(): Contract {
    return new ethers.Contract(
      this.nfToken2.address,
      this.nfToken2.abi,
      this.provider,
    );
  }

  get nfToken3Contract(): Contract {
    return new ethers.Contract(
      this.nfToken3.address,
      this.nfToken3.abi,
      this.provider,
    );
  }

  get nfToken4Contract(): Contract {
    return new ethers.Contract(
      this.nfToken4.address,
      this.nfToken4.abi,
      this.provider,
    );
  }

  get nfToken5Contract(): Contract {
    return new ethers.Contract(
      this.nfToken5.address,
      this.nfToken5.abi,
      this.provider,
    );
  }
}
