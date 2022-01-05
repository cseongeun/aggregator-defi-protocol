import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { BakerySwapBinanceSmartChainApiService } from './binance-smart-chain/bakery-swap.binance-smart-chain.api.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [BakerySwapBinanceSmartChainApiService],
  exports: [BakerySwapBinanceSmartChainApiService],
})
export class BakerySwapApiModule {}
