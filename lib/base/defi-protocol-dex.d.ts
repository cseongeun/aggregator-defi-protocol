import { BigNumber, Contract } from 'ethers';
import { Constructor } from '@seongeun/aggregator-util/lib/constructor';
export declare function DeFiProtocolDEX<T extends Constructor>(C: T): (abstract new (...args: any[]) => {
    readonly dexFactoryAddress: string;
    readonly dexFactoryInitCodeHash: string;
    readonly dexFactoryAbi: any[];
    readonly dexFactoryContract: Contract;
    getDEXFactoryTotalLength(): Promise<BigNumber>;
    getDEXFactoryInfos(pids: number[]): Promise<string[]>;
}) & T;
