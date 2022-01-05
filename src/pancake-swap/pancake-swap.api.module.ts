import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { PancakeSwapBinanceSmartChainApiService } from './binance-smart-chain/pancake-swap.binance-smart-chain.api.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [PancakeSwapBinanceSmartChainApiService],
  exports: [PancakeSwapBinanceSmartChainApiService],
})
export class PancakeSwapAPiModule {}
