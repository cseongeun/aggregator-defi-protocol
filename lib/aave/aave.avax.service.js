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
exports.AaveAVAXService = void 0;
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
const constant_1 = require("@seongeun/aggregator-base/lib/constant");
const service_1 = require("@seongeun/aggregator-base/lib/service");
const bignumber_1 = require("@seongeun/aggregator-util/lib/bignumber");
const encodeDecode_1 = require("@seongeun/aggregator-util/lib/encodeDecode");
const evm_contract_1 = require("@seongeun/aggregator-util/lib/multicall/evm-contract");
const type_1 = require("@seongeun/aggregator-util/lib/type");
const array_1 = require("@seongeun/aggregator-util/lib/array");
const object_1 = require("@seongeun/aggregator-util/lib/object");
const decimals_1 = require("@seongeun/aggregator-util/lib/decimals");
const extension_base_1 = require("../extension/extension.base");
const extension_lending_1 = require("../extension/extension.lending");
const aave_constant_1 = require("./aave.constant");
let AaveAVAXService = class AaveAVAXService extends (0, extension_lending_1.LendingExtension)(extension_base_1.BaseExtension) {
    constructor(networkService, protocolService, contractService) {
        super(networkService, protocolService, contractService);
        this.networkService = networkService;
        this.protocolService = protocolService;
        this.contractService = contractService;
        this.name = constant_1.PROTOCOL_NAME.AAVE;
        this.chainType = constant_1.NETWORK_CHAIN_TYPE.EVM;
        this.chainId = constant_1.NETWORK_CHAIN_ID.AVAX;
        this.constants = aave_constant_1.INFO[constant_1.NETWORK_CHAIN_ID.AVAX];
    }
    async getLendingsByAddress(lendings, address) {
        return this._trackingLendingsByAddress(lendings, address);
    }
    get provider() {
        return super.provider;
    }
    get lending() {
        const address = this.constants.lending.address;
        const abi = this.addressABI.get(address);
        return {
            address,
            abi,
        };
    }
    get aToken() {
        const address = this.constants.lending.a_token_sample_address;
        const abi = this.addressABI.get(address);
        return {
            address,
            abi,
        };
    }
    get vToken() {
        const address = this.constants.lending.v_token_sample_address;
        const abi = this.addressABI.get(address);
        return {
            address,
            abi,
        };
    }
    get sToken() {
        const address = this.constants.lending.s_token_sample_address;
        const abi = this.addressABI.get(address);
        return {
            address,
            abi,
        };
    }
    get lendingIncentiveController() {
        const address = this.constants.lending.incentive_controller_address;
        const abi = this.addressABI.get(address);
        return {
            address,
            abi,
        };
    }
    get lendingDataProvider() {
        const address = this.constants.lending.protocol_data_provider_address;
        const abi = this.addressABI.get(address);
        return {
            address,
            abi,
        };
    }
    get lendingContract() {
        return new ethers_1.ethers.Contract(this.lending.address, this.lending.abi, this.provider);
    }
    get lendingIncentiveContract() {
        return new ethers_1.ethers.Contract(this.lendingIncentiveController.address, this.lendingIncentiveController.abi, this.provider);
    }
    get lendingDataProviderContract() {
        return new ethers_1.ethers.Contract(this.lendingDataProvider.address, this.lendingDataProvider.abi, this.provider);
    }
    async getLendingReserveList() {
        return this.lendingContract.getReservesList();
    }
    async getLendingMarketInfos(reserves) {
        const lendingMarketInfosEncode = this._getLendingMarketEncodeData(reserves);
        const lendingMarketInfosBatchCall = await (0, evm_contract_1.getBatchStaticAggregator)(this.provider, this.multiCallAddress, (0, array_1.flat)(lendingMarketInfosEncode));
        const lendingMarketInfosBatchCallMap = (0, array_1.toSplitWithChunkSize)(lendingMarketInfosBatchCall, 3);
        const lendingMarketInfosZip = (0, array_1.zip)(reserves, lendingMarketInfosBatchCallMap);
        return this._formatLendingMarketResult(lendingMarketInfosZip);
    }
    async _trackingLendingsByAddress(markets, address) {
        const output = [];
        if ((0, type_1.isUndefined)(markets))
            return output;
        const lendingInfoEncode = markets.map(({ data }) => {
            const reserve = (0, object_1.get)(JSON.parse(data), 'reserve');
            return [
                this.lendingDataProvider.address,
                (0, encodeDecode_1.encodeFunction)(this.lendingDataProvider.abi, 'getUserReserveData', [
                    reserve,
                    address,
                ]),
            ];
        });
        const lendingInfoBatchCall = await (0, evm_contract_1.getBatchStaticAggregator)(this.provider, this.multiCallAddress, lendingInfoEncode);
        const lendingInfoZip = (0, array_1.zip)(markets, lendingInfoBatchCall);
        lendingInfoZip.forEach((zip) => {
            const [market, result] = zip;
            const { data } = market;
            const [aTokenDecimals, vTokenDecimals] = [
                (0, object_1.get)(JSON.parse(data), 'aTokenDecimals'),
                (0, object_1.get)(JSON.parse(data), 'vTokenDecimals'),
            ];
            const { success: userReserveDataSuccess, returnData: userReserveDataData, } = result;
            const userReserve = (0, encodeDecode_1.validResult)(userReserveDataSuccess, userReserveDataData)
                ? (0, encodeDecode_1.decodeFunctionResultData)(this.lendingDataProvider.abi, 'getUserReserveData', userReserveDataData)
                : null;
            if ((0, type_1.isNull)(userReserve)) {
                return;
            }
            const { currentATokenBalance, currentVariableDebt } = userReserve;
            const supplyAmount = (0, decimals_1.divideDecimals)(currentATokenBalance, aTokenDecimals);
            const borrowAmount = (0, decimals_1.divideDecimals)(currentVariableDebt, vTokenDecimals);
            if ((0, bignumber_1.isZero)(supplyAmount) && (0, bignumber_1.isZero)(borrowAmount)) {
                return;
            }
            market.wallet = {
                supplyAmount: supplyAmount.toString(),
                borrowAmount: borrowAmount.toString(),
            };
            output.push(market);
        });
        return output;
    }
    _getLendingMarketEncodeData(reserves) {
        return reserves.map((address) => {
            return [
                [
                    this.lendingDataProvider.address,
                    (0, encodeDecode_1.encodeFunction)(this.lendingDataProvider.abi, 'getReserveTokensAddresses', [address]),
                ],
                [
                    this.lendingDataProvider.address,
                    (0, encodeDecode_1.encodeFunction)(this.lendingDataProvider.abi, 'getReserveData', [
                        address,
                    ]),
                ],
                [
                    this.lendingDataProvider.address,
                    (0, encodeDecode_1.encodeFunction)(this.lendingDataProvider.abi, 'getReserveConfigurationData', [address]),
                ],
            ];
        });
    }
    _formatLendingMarketResult(lendingMarketInfosZip) {
        return lendingMarketInfosZip.map(([reserve, lendingMarketInfoResult]) => {
            const [{ success: reserveTokenAddressesSuccess, returnData: reserveTokenAddressesData, }, { success: reserveDataSuccess, returnData: reserveDataData }, { success: reserveConfigurationSuccess, returnData: reserveConfigurationData, },] = lendingMarketInfoResult;
            const reserveTokenAddresses = (0, encodeDecode_1.validResult)(reserveTokenAddressesSuccess, reserveTokenAddressesData)
                ? (0, encodeDecode_1.decodeFunctionResultData)(this.lendingDataProvider.abi, 'getReserveTokensAddresses', reserveTokenAddressesData)
                : null;
            const reserveData = (0, encodeDecode_1.validResult)(reserveDataSuccess, reserveDataData)
                ? (0, encodeDecode_1.decodeFunctionResultData)(this.lendingDataProvider.abi, 'getReserveData', reserveDataData)
                : null;
            const reserveConfig = (0, encodeDecode_1.validResult)(reserveConfigurationSuccess, reserveConfigurationData)
                ? (0, encodeDecode_1.decodeFunctionResultData)(this.lendingDataProvider.abi, 'getReserveConfigurationData', reserveConfigurationData)
                : null;
            if ((0, type_1.isNull)(reserveTokenAddresses) ||
                (0, type_1.isNull)(reserveData) ||
                (0, type_1.isNull)(reserveConfig)) {
                return null;
            }
            return Object.assign(Object.assign(Object.assign({ reserve }, reserveTokenAddresses), reserveData), reserveConfig);
        });
    }
};
AaveAVAXService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [service_1.NetworkService,
        service_1.ProtocolService,
        service_1.ContractService])
], AaveAVAXService);
exports.AaveAVAXService = AaveAVAXService;
//# sourceMappingURL=aave.avax.service.js.map