import { BigNumber, Contract, ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { PROTOCOL_NAME, NETWORK_CHAIN_ID, NETWORK_CHAIN_TYPE } from '@seongeun/aggregator-base/lib/constant';
import { ContractService, NetworkService, ProtocolService } from '@seongeun/aggregator-base/lib/service';
import { Farm, NFToken } from '@seongeun/aggregator-base/lib/entity';
import { BaseExtension } from '../extension/extension.base';
import { IContractInfo } from '@seongeun/aggregator-base/lib/contract/contract.interface';
declare const ApeSwapBSCService_base: (abstract new (...args: any[]) => {
    getFarmsByAddress(farms: Farm[], address: string): Promise<any>;
    getFarmTotalLength(): Promise<BigNumber>;
    getFarmTotalAllocPoint(): Promise<BigNumber>;
    getFarmRewardPerBlock(): Promise<ethers.BigNumberish>;
    getFarmInfos(pids: number[]): Promise<any>;
    sortByRewardTokens(tokens: import("@seongeun/aggregator-base/lib/entity").Token[], sortByAddress: string[]): any[];
}) & (abstract new (...args: any[]) => {
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
}) & (abstract new (...args: any[]) => {
    getDEXFactoryTotalLength(): Promise<BigNumber>;
    getDEXFactoryInfos(pids: number[]): Promise<string[]>;
}) & typeof BaseExtension;
export declare class ApeSwapBSCService extends ApeSwapBSCService_base {
    readonly networkService: NetworkService;
    readonly protocolService: ProtocolService;
    readonly contractService: ContractService;
    name: PROTOCOL_NAME;
    chainType: NETWORK_CHAIN_TYPE;
    chainId: NETWORK_CHAIN_ID;
    constants: {
        farm: {
            name: string;
            address: string;
        };
        dex: {
            factory_address: string;
            factory_init_code_hash: string;
        };
        nf_token: {
            address: string;
        };
    };
    constructor(networkService: NetworkService, protocolService: ProtocolService, contractService: ContractService);
    getFarmsByAddress(farms: Farm[], address: string): Promise<any>;
    getNFTokensByAddress(address: string): Promise<NFToken[]>;
    get provider(): Provider;
    get farm(): IContractInfo;
    get dexFactory(): IContractInfo;
    get nfToken(): IContractInfo;
    get farmContract(): Contract;
    get dexFactoryContract(): Contract;
    get nfTokenContract(): Contract;
    getFarmTotalLength(): Promise<BigNumber>;
    getFarmTotalAllocPoint(): Promise<BigNumber>;
    getFarmRewardPerBlock(): Promise<BigNumber>;
    getFarmInfos(pids: number[]): Promise<{
        lpToken: string;
        allocPoint: BigNumber;
        lastRewardBlock: BigNumber;
        accCakePerShare: BigNumber;
    }[]>;
    getDEXFactoryTotalLength(): Promise<BigNumber>;
    getDEXFactoryInfos(pids: number[]): Promise<string[]>;
    getNFTokenTotalSupply(): Promise<BigNumber>;
    getNFTokenInfos(pids: number[]): Promise<{
        id: BigNumber;
        owner: string;
        tokenURI: string;
    }[]>;
    private _trackingFarmsByAddress;
    private _trackingNFTokensByAddress;
    private _formatFarmResult;
}
export {};
