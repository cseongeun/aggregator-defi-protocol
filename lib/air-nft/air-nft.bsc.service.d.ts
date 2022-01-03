import { BigNumber, Contract, ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { NetworkService, ContractService, ProtocolService } from '@seongeun/aggregator-base/lib/service';
import { NFToken } from '@seongeun/aggregator-base/lib/entity';
import { NETWORK_CHAIN_ID, NETWORK_CHAIN_TYPE, PROTOCOL_NAME } from '@seongeun/aggregator-base/lib/constant';
import { BaseExtension } from '../extension/extension.base';
import { IContractInfo } from '@seongeun/aggregator-base/lib/interface';
declare const AirNFTBSCService_base: (abstract new (...args: any[]) => {
    getNFTokensByAddress(walletAddress: string): Promise<any>;
    getNFTokenTotalSupply(): Promise<BigNumber>;
    getNFTokenInfos(pids: number[]): Promise<{
        id: BigNumber;
        owner: string;
        tokenURI: string;
    }[]>;
    getNFTokenIndexesByAddress(address: string, nfTokenExtra: {
        address: string;
        abi: any;
    }, networkExtra: {
        provider: ethers.providers.Provider;
        multiCallAddress: string;
    }): Promise<number[]>;
}) & typeof BaseExtension;
export declare class AirNFTBSCService extends AirNFTBSCService_base {
    readonly networkService: NetworkService;
    readonly protocolService: ProtocolService;
    readonly contractService: ContractService;
    name: PROTOCOL_NAME;
    chainType: NETWORK_CHAIN_TYPE;
    chainId: NETWORK_CHAIN_ID;
    constants: {
        nf_token: {
            address: string;
        };
    };
    constructor(networkService: NetworkService, protocolService: ProtocolService, contractService: ContractService);
    getNFTokensByAddress(address: string): Promise<NFToken[]>;
    get provider(): Provider;
    get nfToken(): IContractInfo;
    get nfTokenContract(): Contract;
    getNFTokenTotalSupply(): Promise<BigNumber>;
    getNFTokenInfos(pids: number[]): Promise<{
        id: BigNumber;
        owner: string;
        tokenURI: string;
    }[]>;
    private _trackingNFTokensByAddress;
}
export {};
