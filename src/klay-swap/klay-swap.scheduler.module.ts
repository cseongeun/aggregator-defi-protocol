import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { KlaySwapKlaytnSchedulerService } from './klaytn/klay-swap.klaytn.scheduler.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [KlaySwapKlaytnSchedulerService],
  exports: [KlaySwapKlaytnSchedulerService],
})
export class KlaySwapSchedulerModule {}
