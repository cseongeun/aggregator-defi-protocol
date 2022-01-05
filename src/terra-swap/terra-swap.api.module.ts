import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { TerraSwapTerraApiService } from './terra/terra-swap.terra.api.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [TerraSwapTerraApiService],
  exports: [TerraSwapTerraApiService],
})
export class TerraSwapApiModule {}
