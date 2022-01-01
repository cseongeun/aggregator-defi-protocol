import { Module } from '@nestjs/common';
import { PancakeSwapModule } from './pancake-swap/pancake-swap.module';
import { DefiService } from './protocol.service';
import { AirNftModule } from './air-nft/air-nft.module';
import { ApeSwapModule } from './ape-swap/ape-swap.module';
import { AutoFarmModule } from './auto-farm/auto-farm.module';
import { BiSwapModule } from './bi-swap/bi-swap.module';
import { SushiSwapModule } from './sushi-swap/sushi-swap.module';
import { VenusModule } from './venus/venus.module';
import { MdexModule } from './mdex/mdex.module';
import { BakerySwapModule } from './bakery-swap/bakery-swap.module';
import { WaultSwapModule } from './wault-swap/wault-swap.module';
import { KlaySwapModule } from './klay-swap/klay-swap.module';
import { QuickSwapModule } from './quick-swap/quick-swap.module';
import { AaveModule } from './aave/aave.module';
import { TerraSwapModule } from './terra-swap/terra-swap.module';

@Module({
  imports: [
    PancakeSwapModule,
    AirNftModule,
    ApeSwapModule,
    AutoFarmModule,
    BiSwapModule,
    SushiSwapModule,
    VenusModule,
    MdexModule,
    BakerySwapModule,
    WaultSwapModule,
    KlaySwapModule,
    QuickSwapModule,
    AaveModule,
    TerraSwapModule,
  ],
  providers: [DefiService],
  exports: [DefiService],
})
export class DefiModule {}
