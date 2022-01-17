import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { SushiSwapAvalancheApiService } from './avalanche/sushi-swap.avalanche.api.service';
import { SushiSwapBinanceSmartChainApiService } from './binance-smart-chain/sushi-swap.binance-smart-chain.api.service';
import { SushiSwapFantomApiService } from './fantom/sushi-swap.fantom.api.service';
import { SushiSwapHecoApiService } from './heco/sushi-swap.heco.api.service';
import { SushiSwapPolygonApiService } from './polygon/sushi-swap.polygon.api.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [
    SushiSwapAvalancheApiService,
    SushiSwapBinanceSmartChainApiService,
    SushiSwapFantomApiService,
    SushiSwapHecoApiService,
    SushiSwapPolygonApiService,
  ],
  exports: [
    SushiSwapAvalancheApiService,
    SushiSwapBinanceSmartChainApiService,
    SushiSwapFantomApiService,
    SushiSwapHecoApiService,
    SushiSwapPolygonApiService,
  ],
})
export class SushiSwapApiModule {}
