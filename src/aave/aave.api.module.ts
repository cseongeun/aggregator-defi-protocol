import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { AaveAvalancheApiService } from '../aave/avalanche/aave.avalanche.api.service';
import { AavePolygonApiService } from '../aave/polygon/aave.polygon.api.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [AaveAvalancheApiService, AavePolygonApiService],
  exports: [AaveAvalancheApiService, AavePolygonApiService],
})
export class AaveApiModule {}
