import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { BiSwapBinanceSmartChainApiService } from './binance-smart-chain/bi-swap.binance-smart-chain.api.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [BiSwapBinanceSmartChainApiService],
  exports: [BiSwapBinanceSmartChainApiService],
})
export class BiSwapApiModule {}
