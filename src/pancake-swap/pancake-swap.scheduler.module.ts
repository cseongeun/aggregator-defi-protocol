import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { PancakeSwapBinanceSmartChainSchedulerService } from './binance-smart-chain/pancake-swap.binance-smart-chain.scheduler.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [PancakeSwapBinanceSmartChainSchedulerService],
  exports: [PancakeSwapBinanceSmartChainSchedulerService],
})
export class PancakeSwapSchedulerModule {}
