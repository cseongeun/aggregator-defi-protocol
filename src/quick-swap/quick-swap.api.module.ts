import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { QuickSwapPolygonApiService } from './polygon/quick-swap.polygon.api.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [QuickSwapPolygonApiService],
  exports: [QuickSwapPolygonApiService],
})
export class QuickSwapApiModule {}
