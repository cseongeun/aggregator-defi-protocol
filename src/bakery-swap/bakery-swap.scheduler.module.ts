import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { BakerySwapBinanceSmartChainSchedulerService } from './binance-smart-chain/bakery-swap.binance-smart-chain.scheduler.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [BakerySwapBinanceSmartChainSchedulerService],
  exports: [BakerySwapBinanceSmartChainSchedulerService],
})
export class BakerySwapSchedulerModule {}
