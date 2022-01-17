import { Contract, ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import {
  NETWORK_CHAIN_ID,
  PROTOCOL_NAME,
  NETWORK_CHAIN_TYPE,
} from '@seongeun/aggregator-base/lib/constant';
import { IContractInfo } from '@seongeun/aggregator-base/lib/interface';
import {
  NetworkService,
  ProtocolService,
  ContractService,
} from '@seongeun/aggregator-base/lib/service';
import { INFO } from '../aave.constant';
import { Injectable } from '@nestjs/common';
import { DeFiProtocolBase } from '../../defi-protocol.base';

@Injectable()
export abstract class AaveAvalancheBase extends DeFiProtocolBase {
  name = PROTOCOL_NAME.AAVE;
  chainType = NETWORK_CHAIN_TYPE.EVM;
  chainId = NETWORK_CHAIN_ID.AVALANCHE;
  constants = INFO[NETWORK_CHAIN_ID.AVALANCHE];

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
    return {
      name,
      address,
      abi,
    };
  }

  get aToken(): IContractInfo {
    const address = this.constants.lending.a_token_sample_address;
    const abi = this.addressABI.get(address);
    return {
      address,
      abi,
    };
  }

  get vToken(): IContractInfo {
    const address = this.constants.lending.v_token_sample_address;
    const abi = this.addressABI.get(address);
    return {
      address,
      abi,
    };
  }

  get sToken(): IContractInfo {
    const address = this.constants.lending.s_token_sample_address;
    const abi = this.addressABI.get(address);
    return {
      address,
      abi,
    };
  }

  get lendingIncentiveController(): IContractInfo {
    const address = this.constants.lending.incentive_controller_address;
    const abi = this.addressABI.get(address);
    return {
      address,
      abi,
    };
  }

  get lendingDataProvider(): IContractInfo {
    const address = this.constants.lending.protocol_data_provider_address;
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

  get lendingIncentiveContract(): Contract {
    return new ethers.Contract(
      this.lendingIncentiveController.address,
      this.lendingIncentiveController.abi,
      this.provider,
    );
  }

  get lendingDataProviderContract(): Contract {
    return new ethers.Contract(
      this.lendingDataProvider.address,
      this.lendingDataProvider.abi,
      this.provider,
    );
  }
}
