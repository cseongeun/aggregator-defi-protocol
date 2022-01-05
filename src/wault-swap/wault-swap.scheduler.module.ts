import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { WaultSwapBinanceSmartChainSchedulerService } from './binance-smart-chain/wault-swap.binance-smart-chain.scheduler.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [WaultSwapBinanceSmartChainSchedulerService],
  exports: [WaultSwapBinanceSmartChainSchedulerService],
})
export class WaultSwapSchedulerModule {}
