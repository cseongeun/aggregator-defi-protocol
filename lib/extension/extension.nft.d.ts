import { BigNumber } from 'ethers';
import { Constructor } from '@seongeun/aggregator-util/lib/constructor';
export declare function NFTExtension<T extends Constructor>(C: T): (abstract new (...args: any[]) => {
    getNFTokensByAddress(walletAddress: string): Promise<any>;
    getNFTokenTotalSupply(): Promise<BigNumber>;
    getNFTokenInfos(pids: number[]): Promise<{
        id: BigNumber;
        owner: string;
        tokenURI: string;
    }[]>;
}) & T;
