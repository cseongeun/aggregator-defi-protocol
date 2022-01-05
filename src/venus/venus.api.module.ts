import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { VenusBinanceSmartChainApiService } from './binance-smart-chain/venus.binance-smart-chain.api.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [VenusBinanceSmartChainApiService],
  exports: [VenusBinanceSmartChainApiService],
})
export class VenusApiModule {}
