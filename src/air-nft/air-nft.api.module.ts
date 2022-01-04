import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { AirNFTBinanceSmartChainApiService } from './binance-smart-chain/air-nft.binance-smart-chain.api.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [AirNFTBinanceSmartChainApiService],
  exports: [AirNFTBinanceSmartChainApiService],
})
export class AirNFTApiModule {}
