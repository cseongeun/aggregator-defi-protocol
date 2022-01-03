import { BigNumber, Contract } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { NETWORK_CHAIN_ID, NETWORK_CHAIN_TYPE, Lending, NetworkService, ProtocolService, ContractService } from '@seongeun/aggregator-base';
import { DeFiProtocolBase } from '../base/defi-protocol-base';
declare const AaveAVAXService_base: (abstract new (...args: any[]) => {
    getLendingsByAddress(lendings: Lending[], address: string): Promise<any>;
}) & typeof DeFiProtocolBase;
export declare class AaveAVAXService extends AaveAVAXService_base {
    readonly networkService: NetworkService;
    readonly protocolService: ProtocolService;
    readonly contractService: ContractService;
    name: string;
    chainType: NETWORK_CHAIN_TYPE;
    chainId: NETWORK_CHAIN_ID;
    constants: {
        lending: {
            address: string;
            incentive_controller_address: string;
            protocol_data_provider_address: string;
            a_token_sample_address: string;
            v_token_sample_address: string;
            s_token_sample_address: string;
        };
    };
    constructor(networkService: NetworkService, protocolService: ProtocolService, contractService: ContractService);
    getLendingsByAddress(lendings: Lending[], address: string): Promise<any>;
    get provider(): Provider;
    get lendingAddress(): string;
    get lendingAbi(): any[];
    get lendingContract(): Contract;
    get aTokenSampleAddress(): string;
    get aTokenAbi(): any[];
    get vTokenSampleAddress(): string;
    get vTokenAbi(): any[];
    get sTokenSampleAddress(): string;
    get sTokenAbi(): any[];
    get lendingIncentiveAddress(): string;
    get lendingIncentiveAbi(): any[];
    get lendingIncentiveContract(): Contract;
    get lendingDataProviderAddress(): string;
    get lendingDataProviderAbi(): any[];
    get lendingDataProviderContract(): Contract;
    getLendingReserveList(): Promise<string[]>;
    getLendingMarketInfos(reserves: string[]): Promise<{
        reserve: string;
        aTokenAddress: string;
        stableDebtTokenAddress: string;
        variableDebtTokenAddress: string;
        availableLiquidity: BigNumber;
        totalStableDebt: BigNumber;
        totalVariableDebt: BigNumber;
        liquidityRate: BigNumber;
        variableBorrowRate: BigNumber;
        stableBorrowRate: BigNumber;
        averageStableBorrowRate: BigNumber;
        liquidityIndex: BigNumber;
        variableBorrowIndex: BigNumber;
        lastUpdateTimestamp: number;
        decimals: BigNumber;
        ltv: BigNumber;
        liquidationThreshold: BigNumber;
        liquidationBonus: BigNumber;
        reserveFactor: BigNumber;
        usageAsCollateralEnabled: boolean;
        borrowingEnabled: boolean;
        stableBorrowRateEnabled: boolean;
        isActive: boolean;
        isFrozen: boolean;
    }[]>;
    private _trackingLendingsByAddress;
    private _getLendingMarketEncodeData;
    private _formatLendingMarketResult;
}
export {};
