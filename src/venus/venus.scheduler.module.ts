import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { VenusBinanceSmartChainSchedulerService } from './binance-smart-chain/venus.binance-smart-chain.scheduler.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [VenusBinanceSmartChainSchedulerService],
  exports: [VenusBinanceSmartChainSchedulerService],
})
export class VenusSchedulerModule {}
