import { Injectable } from '@nestjs/common';
import { LCDClient } from '@terra-money/terra.js';
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
import { INFO } from '../terra-swap.constant';

@Injectable()
export class TerraSwapTerraBase extends DeFiProtocolBase {
  name = PROTOCOL_NAME.TERRA_SWAP;
  chainType = NETWORK_CHAIN_TYPE.TERRA;
  chainId = NETWORK_CHAIN_ID.TERRA;
  constants = INFO[NETWORK_CHAIN_ID.TERRA];

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
  get provider(): LCDClient {
    return super.provider as LCDClient;
  }

  get dexFactory(): IContractInfo {
    const address = this.constants.dex.factory_address;
    const abi = [];
    const initCodeHash = '';
    return {
      address,
      abi,
      initCodeHash,
    };
  }
}
