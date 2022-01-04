import { Module } from '@nestjs/common';
import { AaveApiModule } from './aave/aave.api.module';
import { AirNFTApiModule } from './air-nft/air-nft.api.module';
import { ApeSwapApiModule } from './ape-swap/ape-swap.api.module';
import { DeFiProtocolApiService } from './defi-protocol.api.service';

@Module({
  imports: [AaveApiModule, AirNFTApiModule, ApeSwapApiModule],
  providers: [DeFiProtocolApiService],
  exports: [DeFiProtocolApiService],
})
export class DefiProtocolApiModule {}
