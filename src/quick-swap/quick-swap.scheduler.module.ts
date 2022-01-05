import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { QuickSwapPolygonSchedulerService } from './polygon/quick-swap.polygon.scheduler.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [QuickSwapPolygonSchedulerService],
  exports: [QuickSwapPolygonSchedulerService],
})
export class QuickSwapSchedulerModule {}
