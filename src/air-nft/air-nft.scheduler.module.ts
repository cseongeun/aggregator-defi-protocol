import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { AirNFTBinanceSmartChainSchedulerService } from './binance-smart-chain/air-nft.binance-smart-chain.scheduler.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [AirNFTBinanceSmartChainSchedulerService],
  exports: [AirNFTBinanceSmartChainSchedulerService],
})
export class AirNFTSchedulerModule {}
