import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
export declare class MysqlConfigService implements TypeOrmOptionsFactory {
    createTypeOrmOptions(): TypeOrmModuleOptions;
}
export declare class TestModule {
    module: TestingModule;
    app: INestApplication;
    createTestModule(): Promise<INestApplication>;
}
