import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { WaultSwapBinanceSmartChainApiService } from './binance-smart-chain/wault-swap.binance-smart-chain.api.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [WaultSwapBinanceSmartChainApiService],
  exports: [WaultSwapBinanceSmartChainApiService],
})
export class WaultSwapApiModule {}
