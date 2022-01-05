import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  TypeOrmModule,
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from '@nestjs/typeorm';
import { typeOrmConfig } from '@seongeun/aggregator-base/lib/extension';
import { AaveApiModule } from '../../aave/aave.api.module';
import { AaveSchedulerModule } from '../../aave/aave.scheduler.module';
import { AirNFTApiModule } from '../../air-nft/air-nft.api.module';
import { AirNFTSchedulerModule } from '../../air-nft/air-nft.scheduler.module';
import { ApeSwapApiModule } from '../../ape-swap/ape-swap.api.module';
import { ApeSwapSchedulerModule } from '../../ape-swap/ape-swap.scheduler.module';
import { AutoFarmApiModule } from '../../auto-farm/auto-farm.api.module';
import { AutoFarmSchedulerModule } from '../../auto-farm/auto-farm.scheduler.module';
import { BakerySwapApiModule } from '../../bakery-swap/bakery-swap.api.module';
import { BakerySwapSchedulerModule } from '../../bakery-swap/bakery-swap.scheduler.module';
import { BiSwapApiModule } from '../../bi-swap/bi-swap.api.module';
import { BiSwapSchedulerModule } from '../../bi-swap/bi-swap.scheduler.module';
import { KlaySwapApiModule } from '../../klay-swap/klay-swap.api.module';
import { KlaySwapSchedulerModule } from '../../klay-swap/klay-swap.scheduler.module';
import { MdexApiModule } from '../../mdex/mdex.api.module';
import { MdexSchedulerModule } from '../../mdex/mdex.scheduler.module';
import { PancakeSwapAPiModule } from '../../pancake-swap/pancake-swap.api.module';
import { PancakeSwapSchedulerModule } from '../../pancake-swap/pancake-swap.scheduler.module';
import { QuickSwapApiModule } from '../../quick-swap/quick-swap.api.module';
import { QuickSwapSchedulerModule } from '../../quick-swap/quick-swap.scheduler.module';
import { SushiSwapApiModule } from '../../sushi-swap/sushi-swap.api.module';
import { SushiSwapSchedulerModule } from '../../sushi-swap/sushi-swap.scheduler.module';
import { TerraSwapApiModule } from '../../terra-swap/terra-swap.api.module';
import { TerraSwapSchedulerModule } from '../../terra-swap/terra-swap.scheduler.module';
import { VenusApiModule } from '../../venus/venus.api.module';
import { VenusSchedulerModule } from '../../venus/venus.scheduler.module';
import { WaultSwapApiModule } from '../../wault-swap/wault-swap.api.module';
import { WaultSwapSchedulerModule } from '../../wault-swap/wault-swap.scheduler.module';

export class MysqlConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      ...typeOrmConfig(
        'mysql',
        process.env.MYSQL_HOST,
        process.env.MYSQL_PORT,
        process.env.MYSQL_USERNAME,
        process.env.MYSQL_PASSWORD,
        process.env.MYSQL_DATABASE,
      ),
      type: 'mysql',
    };
  }
}
export class TestModule {
  module: TestingModule;
  app: INestApplication;

  async createTestModule(): Promise<INestApplication> {
    this.module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({ useClass: MysqlConfigService }),
        // Aave
        AaveApiModule,
        AaveSchedulerModule,

        // AirNFT
        AirNFTApiModule,
        AirNFTSchedulerModule,

        // ApeSwap
        ApeSwapApiModule,
        ApeSwapSchedulerModule,

        // AutoFarm
        AutoFarmApiModule,
        AutoFarmSchedulerModule,

        // BakerySwap
        BakerySwapApiModule,
        BakerySwapSchedulerModule,

        // BiSwap
        BiSwapApiModule,
        BiSwapSchedulerModule,

        // KlaySwap
        KlaySwapApiModule,
        KlaySwapSchedulerModule,

        // Mdex
        MdexApiModule,
        MdexSchedulerModule,

        // PancakeSwap
        PancakeSwapAPiModule,
        PancakeSwapSchedulerModule,

        // QuickSwap
        QuickSwapApiModule,
        QuickSwapSchedulerModule,

        // SushiSwap
        SushiSwapApiModule,
        SushiSwapSchedulerModule,

        // TerraSwap
        TerraSwapApiModule,
        TerraSwapSchedulerModule,

        // Venus
        VenusApiModule,
        VenusSchedulerModule,

        // WaultSwap
        WaultSwapApiModule,
        WaultSwapSchedulerModule,
      ],
    }).compile();

    this.app = this.module.createNestApplication();

    await this.app.init();
    return this.app;
  }
}
