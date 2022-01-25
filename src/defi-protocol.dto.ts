import { Farm } from '@seongeun/aggregator-base/lib/entity';

export class ProtocolFarmResponseDTO extends Farm {
  portfolio: {
    stakeAmounts: string[];
    rewardAmounts: string[];
  };
}
