import { Module } from '@nestjs/common';
import { AaveSchedulerModule } from './aave/aave.scheduler.module';
import { AirNFTSchedulerModule } from './air-nft/air-nft.scheduler.module';
import { ApeSwapSchedulerModule } from './ape-swap/ape-swap.scheduler.module';

@Module({
  imports: [AaveSchedulerModule, AirNFTSchedulerModule, ApeSwapSchedulerModule],
  providers: [],
  exports: [],
})
export class DefiProtocolSchedulerModule {}
