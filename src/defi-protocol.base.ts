import { Injectable, OnModuleInit } from '@nestjs/common';
import { In } from 'typeorm';
import { Provider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import {
  Token,
  Contract,
  Network,
  Protocol,
} from '@seongeun/aggregator-base/lib/entity';
import {
  NetworkService,
  ProtocolService,
  ContractService,
} from '@seongeun/aggregator-base/lib/service';
import {
  TAggregatorProvider,
  TContractAbi,
} from '@seongeun/aggregator-base/lib/interface';
import { isUndefined } from '@seongeun/aggregator-util/lib/type';
import { NETWORK_CHAIN_TYPE } from '@seongeun/aggregator-base/lib/constant';
import { EXCEPTION_CODE } from '@seongeun/aggregator-common';

@Injectable()
export abstract class DeFiProtocolBase implements OnModuleInit {
  public isProtocolService = true;

  public name: string;
  public chainType: NETWORK_CHAIN_TYPE;
  public chainId: string;
  public constants: { [key: string]: any };

  public network: Network;
  public protocol: Protocol;
  public token?: Token;

  // Search ABI by address
  protected addressABI = new Map<string, TContractAbi>();

  constructor(
    public readonly networkService: NetworkService,
    public readonly protocolService: ProtocolService,
    public readonly contractService: ContractService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.network = await this.networkService.repository.findOneBy({
      chainType: this.chainType,
      chainId: this.chainId,
    });

    // if (isUndefined(this.network)) {
    //   throw Error(EXCEPTION_CODE.ERR3000);
    // }

    this.protocol = await this.protocolService.repository.findOneBy({
      name: this.name,
      network: this.network,
    });

    // if (isUndefined(this.protocol)) {
    //   throw new Error(EXCEPTION_CODE.ERR3001);
    // }

    this.token = this.protocol.token;

    await this._injectABI();
  }

  get provider(): TAggregatorProvider {
    return this.networkService.provider(this.network.chainKey);
  }

  getBalance(address: string): Promise<BigNumber> {
    switch (this.chainType) {
      case NETWORK_CHAIN_TYPE.EVM: {
        return (this.provider as Provider).getBalance(address);
      }
    }
  }

  get blockTimeSecond(): number {
    return this.network.blockTimeSec;
  }

  get multiCallAddress(): string {
    return this.network.multiCallAddress;
  }

  get useFarm(): boolean {
    return this.protocol.useFarm;
  }

  get useLending(): boolean {
    return this.protocol.useLending;
  }

  get useDex(): boolean {
    return this.protocol.useDex;
  }

  get useNFT(): boolean {
    return this.protocol.useNFT;
  }

  async getBlockNumber(): Promise<number> {
    switch (this.network.chainType) {
      case NETWORK_CHAIN_TYPE.EVM: {
        return (this.provider as Provider).getBlockNumber();
      }
    }
  }

  // TODO: 로직 수정 필요
  private async _injectABI(): Promise<void> {
    for await (const {
      address,
      sample_address,
      factory_address,
      bentoAddress,
      kashi_address,
      incentive_controller_address,
      a_token_sample_address,
      v_token_sample_address,
      s_token_sample_address,
      protocol_data_provider_address,
    } of Object.values(this.constants)) {
      try {
        const findABIAddress = [];

        if (!isUndefined(address)) {
          findABIAddress.push(address);
        }

        if (!isUndefined(sample_address)) {
          findABIAddress.push(sample_address);
        }

        if (!isUndefined(factory_address)) {
          findABIAddress.push(factory_address);
        }

        if (!isUndefined(a_token_sample_address)) {
          findABIAddress.push(a_token_sample_address);
        }

        if (!isUndefined(s_token_sample_address)) {
          findABIAddress.push(s_token_sample_address);
        }

        if (!isUndefined(v_token_sample_address)) {
          findABIAddress.push(v_token_sample_address);
        }

        if (!isUndefined(bentoAddress)) {
          findABIAddress.push(bentoAddress);
        }

        if (!isUndefined(kashi_address)) {
          findABIAddress.push(kashi_address);
        }

        if (!isUndefined(incentive_controller_address)) {
          findABIAddress.push(incentive_controller_address);
        }

        if (!isUndefined(protocol_data_provider_address)) {
          findABIAddress.push(protocol_data_provider_address);
        }

        const contracts = await this.contractService.repository.findAllBy({
          network: this.network,
          address: In(findABIAddress),
        });

        contracts.forEach((entity: Contract) => {
          const abi: any = entity.getABI();

          if (isUndefined(abi)) {
            throw Error;
          }

          this.addressABI.set(entity.address, JSON.parse(abi));
        });
      } catch (e) {
        throw new Error('Not found contract entity');
      }
    }
  }
}
