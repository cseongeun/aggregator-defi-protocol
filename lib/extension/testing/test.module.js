"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestModule = exports.MysqlConfigService = void 0;
require("dotenv/config");
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const extension_1 = require("@seongeun/aggregator-base/lib/extension");
const aave_api_module_1 = require("../../aave/aave.api.module");
const aave_scheduler_module_1 = require("../../aave/aave.scheduler.module");
const air_nft_api_module_1 = require("../../air-nft/air-nft.api.module");
const air_nft_scheduler_module_1 = require("../../air-nft/air-nft.scheduler.module");
const ape_swap_api_module_1 = require("../../ape-swap/ape-swap.api.module");
const ape_swap_scheduler_module_1 = require("../../ape-swap/ape-swap.scheduler.module");
class MysqlConfigService {
    createTypeOrmOptions() {
        return Object.assign(Object.assign({}, (0, extension_1.typeOrmConfig)('mysql', process.env.MYSQL_HOST, process.env.MYSQL_PORT, process.env.MYSQL_USERNAME, process.env.MYSQL_PASSWORD, process.env.MYSQL_DATABASE)), { type: 'mysql' });
    }
}
exports.MysqlConfigService = MysqlConfigService;
class TestModule {
    async createTestModule() {
        this.module = await testing_1.Test.createTestingModule({
            imports: [
                typeorm_1.TypeOrmModule.forRootAsync({ useClass: MysqlConfigService }),
                aave_api_module_1.AaveApiModule,
                aave_scheduler_module_1.AaveSchedulerModule,
                air_nft_api_module_1.AirNFTApiModule,
                air_nft_scheduler_module_1.AirNFTSchedulerModule,
                ape_swap_api_module_1.ApeSwapApiModule,
                ape_swap_scheduler_module_1.ApeSwapSchedulerModule,
            ],
        }).compile();
        this.app = this.module.createNestApplication();
        await this.app.init();
        return this.app;
    }
}
exports.TestModule = TestModule;
//# sourceMappingURL=test.module.js.map