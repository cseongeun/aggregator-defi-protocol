import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { MdexBinanceSmartChainApiService } from './binance-smart-chain/mdex.binance-smart-chain.api.service';
import { MdexHecoApiService } from './heco/mdex.heco.api.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [MdexHecoApiService, MdexBinanceSmartChainApiService],
  exports: [MdexHecoApiService, MdexBinanceSmartChainApiService],
})
export class MdexApiModule {}
