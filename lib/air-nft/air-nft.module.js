"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirNftModule = void 0;
const common_1 = require("@nestjs/common");
const module_1 = require("@seongeun/aggregator-base/lib/module");
const air_nft_bsc_service_1 = require("./air-nft.bsc.service");
let AirNftModule = class AirNftModule {
};
AirNftModule = __decorate([
    (0, common_1.Module)({
        imports: [module_1.NetworkModule, module_1.ProtocolModule, module_1.ContractModule],
        providers: [air_nft_bsc_service_1.AirNFTBSCService],
        exports: [air_nft_bsc_service_1.AirNFTBSCService],
    })
], AirNftModule);
exports.AirNftModule = AirNftModule;
//# sourceMappingURL=air-nft.module.js.map