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
exports.AirNFTBSCService = void 0;
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
const evm_contract_1 = require("@seongeun/aggregator-util/lib/multicall/evm-contract");
const service_1 = require("@seongeun/aggregator-base/lib/service");
const constant_1 = require("@seongeun/aggregator-base/lib/constant");
const extension_base_1 = require("../extension/extension.base");
const extension_nft_1 = require("../extension/extension.nft");
const air_nft_constant_1 = require("./air-nft.constant");
let AirNFTBSCService = class AirNFTBSCService extends (0, extension_nft_1.NFTExtension)(extension_base_1.BaseExtension) {
    constructor(networkService, protocolService, contractService) {
        super(networkService, protocolService, contractService);
        this.networkService = networkService;
        this.protocolService = protocolService;
        this.contractService = contractService;
        this.name = constant_1.PROTOCOL_NAME.AIR_NFT;
        this.chainType = constant_1.NETWORK_CHAIN_TYPE.EVM;
        this.chainId = constant_1.NETWORK_CHAIN_ID.BSC;
        this.constants = air_nft_constant_1.INFO[constant_1.NETWORK_CHAIN_ID.BSC];
    }
    async getNFTokensByAddress(address) {
        return this._trackingNFTokensByAddress(address);
    }
    get provider() {
        return super.provider;
    }
    get nfToken() {
        const address = this.constants.nf_token.address;
        const abi = this.addressABI.get(address);
        return {
            address,
            abi,
        };
    }
    get nfTokenContract() {
        return new ethers_1.ethers.Contract(this.nfToken.address, this.nfToken.abi, this.provider);
    }
    async getNFTokenTotalSupply() {
        return this.nfTokenContract.totalSupply();
    }
    async getNFTokenInfos(pids) {
        return (0, evm_contract_1.getBatchERC721TokenInfos)(this.provider, this.multiCallAddress, this.nfToken.address, pids);
    }
    async _trackingNFTokensByAddress(address) {
        const output = [];
        await Promise.all([[this.nfToken.address, this.nfToken.abi]].map(async ([nfTokenAddress, nfTokenAbi]) => {
            const indexes = await this.getNFTokenIndexesByAddress(address, { address: nfTokenAddress, abi: nfTokenAbi }, {
                provider: this.provider,
                multiCallAddress: this.multiCallAddress,
            });
            if (indexes.length > 0) {
                output.push({ indexes, nfTokenAddress });
            }
        }));
        return output;
    }
};
AirNFTBSCService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [service_1.NetworkService,
        service_1.ProtocolService,
        service_1.ContractService])
], AirNFTBSCService);
exports.AirNFTBSCService = AirNFTBSCService;
//# sourceMappingURL=air-nft.bsc.service.js.map