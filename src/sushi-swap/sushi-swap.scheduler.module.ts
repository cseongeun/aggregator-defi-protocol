import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { SushiSwapAvalancheSchedulerService } from './avalanche/sushi-swap.avalanche.scheduler.service';
import { SushiSwapBinanceSmartChainSchedulerService } from './binance-smart-chain/sushi-swap.binance-smart-chain.scheduler.service';
import { SushiSwapFantomSchedulerService } from './fantom/sushi-swap.fantom.scheduler.service';
import { SushiSwapHecoSchedulerService } from './heco/sushi-swap.heco.scheduler.service';
import { SushiSwapPolygonSchedulerService } from './polygon/sushi-swap.polygon.scheduler.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [
    SushiSwapAvalancheSchedulerService,
    SushiSwapBinanceSmartChainSchedulerService,
    SushiSwapFantomSchedulerService,
    SushiSwapHecoSchedulerService,
    SushiSwapPolygonSchedulerService,
  ],
  exports: [
    SushiSwapAvalancheSchedulerService,
    SushiSwapBinanceSmartChainSchedulerService,
    SushiSwapFantomSchedulerService,
    SushiSwapHecoSchedulerService,
    SushiSwapPolygonSchedulerService,
  ],
})
export class SushiSwapSchedulerModule {}
