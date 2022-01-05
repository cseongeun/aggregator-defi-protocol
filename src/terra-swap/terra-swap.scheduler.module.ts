import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { TerraSwapTerraSchedulerService } from './terra/terra-swap.terra.scheduler.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [TerraSwapTerraSchedulerService],
  exports: [TerraSwapTerraSchedulerService],
})
export class TerraSwapSchedulerModule {}
