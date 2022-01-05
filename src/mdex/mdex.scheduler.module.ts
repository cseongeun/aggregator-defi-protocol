import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { MdexBinanceSmartChainSchedulerService } from './binance-smart-chain/mdex.binance-smart-chain.scheduler.service';
import { MdexHecoSchedulerService } from './heco/mdex.heco.scheduler.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [MdexHecoSchedulerService, MdexBinanceSmartChainSchedulerService],
  exports: [MdexHecoSchedulerService, MdexBinanceSmartChainSchedulerService],
})
export class MdexSchedulerModule {}
