import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { AutoFarmBinanceSmartChainSchedulerService } from './binance-smart-chain/auto-farm.binance-smart-chain.scheduler.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [AutoFarmBinanceSmartChainSchedulerService],
  exports: [AutoFarmBinanceSmartChainSchedulerService],
})
export class AutoFarmSchedulerModule {}
