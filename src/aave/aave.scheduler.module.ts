import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { AaveAvalancheSchedulerService } from '../aave/avalanche/aave.avalanche.scheduler.service';
import { AavePolygonSchedulerService } from '../aave/polygon/aave.polygon.scheduler.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [AaveAvalancheSchedulerService, AavePolygonSchedulerService],
  exports: [AaveAvalancheSchedulerService, AavePolygonSchedulerService],
})
export class AaveSchedulerModule {}
