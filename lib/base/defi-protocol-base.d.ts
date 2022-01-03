import { OnModuleInit } from '@nestjs/common';
import { BigNumber } from '@ethersproject/bignumber';
import { Token, Network, Protocol, NetworkService, ProtocolService, ContractService, AggregatorProvider, NETWORK_CHAIN_TYPE } from '@seongeun/aggregator-base';
export declare class DeFiProtocolBase implements OnModuleInit {
    readonly networkService: NetworkService;
    readonly protocolService: ProtocolService;
    readonly contractService: ContractService;
    isDeFiProtocolService: boolean;
    name: string;
    chainType: NETWORK_CHAIN_TYPE;
    chainId: string;
    constants: {
        [key: string]: any;
    };
    network: Network;
    protocol: Protocol;
    token?: Token;
    addressABI: Map<string, any>;
    constructor(networkService: NetworkService, protocolService: ProtocolService, contractService: ContractService);
    onModuleInit(): Promise<void>;
    get provider(): AggregatorProvider;
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
