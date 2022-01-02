import { BigNumber, Contract } from 'ethers';
import { Constructor } from '@seongeun/aggregator-util/lib/constructor';

export function DeFiProtocolDEX<T extends Constructor>(C: T) {
  abstract class Base extends C {
    constructor(...args: any[]) {
      super(...args);
    }

    abstract get dexFactoryAddress(): string;
    abstract get dexFactoryInitCodeHash(): string;
    abstract get dexFactoryAbi(): any[];
    abstract get dexFactoryContract(): Contract;

    // /**
    //  * 유저의  DEX 정보 조회
    //  * @param walletAddress wallet address
    //  */
    // abstract getWalletDEXs(walletAddress: string): Promise<any>;

    /**
     * 총 DEX Factory에 등록된 pair 갯수
     * @returns Total dex length
     */
    abstract getDEXFactoryTotalLength(): Promise<BigNumber>;

    /**
     * pid에 등록된 Pair 정보 조회 (node Call => 1 회)
     * @param pids pair's pid
     * @returns
     */
    abstract getDEXFactoryInfos(pids: number[]): Promise<string[]>;
  }
  return Base;
}
