import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { AutoFarmBinanceSmartChainApiService } from './binance-smart-chain/auto-farm.binance-smart-chain.api.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [AutoFarmBinanceSmartChainApiService],
  exports: [AutoFarmBinanceSmartChainApiService],
})
export class AutoFarmApiModule {}
