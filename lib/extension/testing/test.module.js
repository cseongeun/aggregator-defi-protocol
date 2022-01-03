"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestModule = exports.MysqlConfigService = void 0;
require("dotenv/config");
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const extension_1 = require("@seongeun/aggregator-base/lib/extension");
const aave_module_1 = require("../../aave/aave.module");
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
                aave_module_1.AaveModule,
            ],
        }).compile();
        this.app = this.module.createNestApplication();
        await this.app.init();
        return this.app;
    }
}
exports.TestModule = TestModule;
//# sourceMappingURL=test.module.js.map