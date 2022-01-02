import { Module } from '@nestjs/common';
import { DeFiProtocolService } from './defi-protocol.service';
import { AaveModule } from './aave/aave.module';

@Module({
  imports: [AaveModule],
  providers: [DeFiProtocolService],
  exports: [DeFiProtocolService],
})
export class DefiProtocolModule {}
