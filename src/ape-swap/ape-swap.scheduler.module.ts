import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { ApeSwapBinanceSmartChainSchedulerService } from './binance-smart-chain/ape-swap.binance-smart-chain.scheduler.service';
import { ApeSwapPolygonSchedulerService } from './polygon/ape-swap.polygon.scheduler.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [
    ApeSwapBinanceSmartChainSchedulerService,
    ApeSwapPolygonSchedulerService,
  ],
  exports: [
    ApeSwapBinanceSmartChainSchedulerService,
    ApeSwapPolygonSchedulerService,
  ],
})
export class ApeSwapSchedulerModule {}
