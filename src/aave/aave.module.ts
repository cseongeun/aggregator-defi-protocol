import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
  TokenModule,
} from '@seongeun/aggregator-base/lib/module';
import { AaveMATICService } from './aave.matic.service';
import { AaveAVAXService } from './aave.avax.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule, TokenModule],
  providers: [AaveMATICService, AaveAVAXService],
  exports: [AaveMATICService, AaveAVAXService],
})
export class AaveModule {}
