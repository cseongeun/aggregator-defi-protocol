"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeFiProtocolService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const type_1 = require("@seongeun/aggregator-util/lib/type");
const defi_protocol_module_1 = require("./defi-protocol.module");
let DeFiProtocolService = class DeFiProtocolService {
    constructor(moduleRef) {
        this.moduleRef = moduleRef;
        this.service = new Map();
    }
    async onModuleInit() {
        const imports = Reflect.getMetadata('imports', defi_protocol_module_1.DefiProtocolModule);
        for (const importModule of imports) {
            const exportModules = Reflect.getMetadata('exports', importModule);
            if (exportModules.length > 0) {
                for (const exportModule of exportModules) {
                    const serviceInstance = this.moduleRef.get(exportModule, {
                        strict: false,
                    });
                    const isDeFiService = serviceInstance.isDeFiProtocolService;
                    if (!isDeFiService || (0, type_1.isUndefined)(isDeFiService)) {
                        continue;
                    }
                    const { protocol } = serviceInstance;
                    this.service.set(protocol.id, serviceInstance);
                }
            }
        }
    }
    getService(id) {
        return this.service.get(id);
    }
};
DeFiProtocolService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModuleRef])
], DeFiProtocolService);
exports.DeFiProtocolService = DeFiProtocolService;
//# sourceMappingURL=defi-protocol.service.js.map