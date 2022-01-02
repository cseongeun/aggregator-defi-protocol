import { BigNumber, BigNumberish } from 'ethers';
import { Constructor } from '@seongeun/aggregator-util/lib/constructor';
import { flat } from '@seongeun/aggregator-util/lib/array';
import { Farm, Token } from '@seongeun/aggregator-base/lib/entity';

export function DeFiProtocolFarm<T extends Constructor>(C: T) {
  abstract class Base extends C {
    constructor(...args: any[]) {
      super(...args);
    }

    /**
     * 지갑의 Farm 관련 정보 조회
     * process <모든 Farm을 조회하기에는 비용이 너무 큼>
     *  1. 프로토콜 관련 Farm 주소 리스트 조회
     *  2. 지갑의 주소와 상호 작용한 Farm 주소 리스트 조회
     *  3. 상호작용한 Farm 주소를 통해 지갑의 Farm 관련 정보 조회
     *
     * @param farms  Farm
     * @param walletAddress 지갑 주소
     */
    abstract getFarmsByAddress(farms: Farm[], address: string): Promise<any>;

    /**
     * 총 Farm 갯수
     * @returns Farm total length
     */
    abstract getFarmTotalLength(): Promise<BigNumber>;

    /**
     * 총 Farm 할당 포인트
     * @returns Farm total alloc point
     */
    abstract getFarmTotalAllocPoint(): Promise<BigNumber>;

    /**
     * Farm의 블록 당 리워드 수
     * @returns Farm reward per block
     */
    abstract getFarmRewardPerBlock(): Promise<BigNumberish>;

    /**
     * pid에 등록된 Farm 정보 조회
     * @param pids farm's pid
     * @returns any
     */
    abstract getFarmInfos(pids: number[]): Promise<any>;

    /**
     * reward index 정렬
     * @param tokens rewardTokens
     * @param sortByAddress sorting by address
     * @returns tokens
     */
    sortByRewardTokens(tokens: Token[], sortByAddress: string[]) {
      return flat(
        sortByAddress.map((sort) =>
          tokens.filter(({ address }) => address === sort),
        ),
      );
    }
  }
  return Base;
}
