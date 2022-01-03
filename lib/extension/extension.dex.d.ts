import { BigNumber } from 'ethers';
import { Constructor } from '@seongeun/aggregator-util/lib/constructor';
export declare function DexExtension<T extends Constructor>(C: T): (abstract new (...args: any[]) => {
    getDEXFactoryTotalLength(): Promise<BigNumber>;
    getDEXFactoryInfos(pids: number[]): Promise<string[]>;
}) & T;
