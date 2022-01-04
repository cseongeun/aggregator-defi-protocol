import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '@seongeun/aggregator-base/lib/extension';
import { AaveApiModule } from '../../aave/aave.api.module';
import { AaveSchedulerModule } from '../../aave/aave.scheduler.module';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { AirNFTApiModule } from '../../air-nft/air-nft.api.module';
import { AirNFTSchedulerModule } from '../../air-nft/air-nft.scheduler.module';
import { ApeSwapApiModule } from '../../ape-swap/ape-swap.api.module';
import { ApeSwapSchedulerModule } from '../../ape-swap/ape-swap.scheduler.module';

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
        AaveApiModule,
        AaveSchedulerModule,

        AirNFTApiModule,
        AirNFTSchedulerModule,

        ApeSwapApiModule,
        ApeSwapSchedulerModule,
      ],
    }).compile();

    this.app = this.module.createNestApplication();

    await this.app.init();
    return this.app;
  }
}
