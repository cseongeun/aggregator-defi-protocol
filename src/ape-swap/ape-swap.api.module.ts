import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { ApeSwapBinanceSmartChainApiService } from './binance-smart-chain/ape-swap.binance-smart-chain.api.service';
import { ApeSwapPolygonApiService } from './polygon/ape-swap.polygon.api.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [ApeSwapBinanceSmartChainApiService, ApeSwapPolygonApiService],
  exports: [ApeSwapBinanceSmartChainApiService, ApeSwapPolygonApiService],
})
export class ApeSwapApiModule {}
