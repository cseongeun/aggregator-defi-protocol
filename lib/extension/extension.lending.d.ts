import { Constructor } from '@seongeun/aggregator-util/lib/constructor';
import { Lending } from '@seongeun/aggregator-base/lib/entity';
export declare function LendingExtension<T extends Constructor>(C: T): (abstract new (...args: any[]) => {
    getLendingsByAddress(lendings: Lending[], address: string): Promise<any>;
}) & T;