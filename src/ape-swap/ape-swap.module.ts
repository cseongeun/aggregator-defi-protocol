import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { ApeSwapBSCService } from './ape-swap.bsc.service';
import { ApeSwapMATICService } from './ape-swap.matic.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [ApeSwapBSCService, ApeSwapMATICService],
  exports: [ApeSwapBSCService, ApeSwapMATICService],
})
export class ApeSwapModule {}
