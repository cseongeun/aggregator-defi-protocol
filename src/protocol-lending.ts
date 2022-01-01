import { Constructor } from '@seongeun/aggregator-util/lib/constructor';
import { Lending } from '@libs/repository/lending/entity';
import { IDeFiLending } from './protocol.interface';

export function ProtocolLending<T extends Constructor>(C: T) {
  abstract class Base extends C implements IDeFiLending {
    constructor(...args: any[]) {
      super(...args);
    }

    /**
     * 지갑의 lending 대출 관련 정보
     * @param walletAddress 지갑 주소
     */
    abstract getLendingsByAddress(
      lendings: Lending[],
      address: string,
    ): Promise<any>;
  }

  return Base;
}
