import { OnModuleInit } from '@nestjs/common';
import { BigNumber } from '@ethersproject/bignumber';
import { Token, Network, Protocol } from '@seongeun/aggregator-base/lib/entity';
import { NetworkService, ProtocolService, ContractService } from '@seongeun/aggregator-base/lib/service';
import { TAggregatorProvider, TContractAbi } from '@seongeun/aggregator-base/lib/interface';
import { NETWORK_CHAIN_TYPE } from '@seongeun/aggregator-base/lib/constant';
export declare class BaseExtension implements OnModuleInit {
    readonly networkService: NetworkService;
    readonly protocolService: ProtocolService;
    readonly contractService: ContractService;
    isProtocolService: boolean;
    name: string;
    chainType: NETWORK_CHAIN_TYPE;
    chainId: string;
    constants: {
        [key: string]: any;
    };
    network: Network;
    protocol: Protocol;
    token?: Token;
    addressABI: Map<string, TContractAbi>;
    constructor(networkService: NetworkService, protocolService: ProtocolService, contractService: ContractService);
    onModuleInit(): Promise<void>;
    get provider(): TAggregatorProvider;
    getBalance(address: string): Promise<BigNumber>;
    get blockTimeSecond(): number;
    get multiCallAddress(): string;
    get useFarm(): boolean;
    get useLending(): boolean;
    get useDex(): boolean;
    get useNFT(): boolean;
    getBlockNumber(): Promise<number>;
    private _injectABI;
}
