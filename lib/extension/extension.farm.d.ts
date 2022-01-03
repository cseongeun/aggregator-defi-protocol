import { BigNumber, BigNumberish } from 'ethers';
import { Constructor } from '@seongeun/aggregator-util/lib/constructor';
import { Farm, Token } from '@seongeun/aggregator-base/lib/entity';
export declare function FarmExtension<T extends Constructor>(C: T): (abstract new (...args: any[]) => {
    getFarmsByAddress(farms: Farm[], address: string): Promise<any>;
    getFarmTotalLength(): Promise<BigNumber>;
    getFarmTotalAllocPoint(): Promise<BigNumber>;
    getFarmRewardPerBlock(): Promise<BigNumberish>;
    getFarmInfos(pids: number[]): Promise<any>;
    sortByRewardTokens(tokens: Token[], sortByAddress: string[]): any[];
}) & T;
