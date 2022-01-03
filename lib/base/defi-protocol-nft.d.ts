import { BigNumber, Contract } from 'ethers';
import { Constructor } from '@seongeun/aggregator-util/lib/constructor';
import { Provider } from '@ethersproject/providers';
export declare function DeFiProtocolNFT<T extends Constructor>(C: T): (abstract new (...args: any[]) => {
    readonly nfTokenAddress: string;
    readonly nfTokenAbi: any[];
    readonly nfTokenContract: Contract;
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
        provider: Provider;
        multiCallAddress: string;
    }): Promise<number[]>;
}) & T;
