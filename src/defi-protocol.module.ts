import { Module } from '@nestjs/common';
import { DeFiProtocolService } from './defi-protocol.service';
import { AaveModule } from './aave/aave.module';
import { AirNFTModule } from './air-nft/air-nft.module';
import { ApeSwapModule } from './ape-swap/ape-swap.module';

@Module({
  imports: [AaveModule, AirNFTModule, ApeSwapModule],
  providers: [DeFiProtocolService],
  exports: [DeFiProtocolService],
})
export class DefiProtocolModule {}
