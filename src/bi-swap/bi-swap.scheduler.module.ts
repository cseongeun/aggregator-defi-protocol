import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { BiSwapBinanceSmartChainSchedulerService } from './binance-smart-chain/bi-swap.binance-smart-chain.scheduler.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [BiSwapBinanceSmartChainSchedulerService],
  exports: [BiSwapBinanceSmartChainSchedulerService],
})
export class BiSwapSchedulerModule {}
