import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { AaveAVAXService } from './aave.avax.service';
import { AaveMATICService } from './aave.matic.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [AaveAVAXService, AaveMATICService],
  exports: [AaveAVAXService, AaveMATICService],
})
export class AaveModule {}
