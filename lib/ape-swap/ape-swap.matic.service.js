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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApeSwapMATICService = void 0;
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
const defi_dex_1 = require("../defi-dex");
const defi_base_1 = require("../defi-base");
const defi_farm_1 = require("../defi-farm");
const constant_1 = require("@libs/helper/constant");
const encodeDecode_1 = require("@libs/helper/encodeDecode");
const batch_contract_1 = require("@libs/helper/batch-contract");
const array_1 = require("@libs/helper/array");
const type_1 = require("@libs/helper/type");
const blockchain_1 = require("@libs/helper/blockchain");
const abi_service_1 = require("../../abi/abi.service");
const network_service_1 = require("../../network/network.service");
const protocol_service_1 = require("../../protocol/protocol.service");
const token_service_1 = require("../../token/token.service");
const ape_swap_constant_1 = require("./ape-swap.constant");
const object_1 = require("@libs/helper/object");
const bignumber_1 = require("@libs/helper/bignumber");
const decimals_1 = require("@libs/helper/decimals");
const constant_2 = require("../../../libs/repository/src/network/constant");
let ApeSwapMATICService = class ApeSwapMATICService extends (0, defi_farm_1.DeFiFarm)((0, defi_dex_1.DeFiDEX)(defi_base_1.DeFiBase)) {
    constructor(networkService, protocolService, tokenService, abiService) {
        super(networkService, protocolService, tokenService, abiService);
        this.networkService = networkService;
        this.protocolService = protocolService;
        this.tokenService = tokenService;
        this.abiService = abiService;
        this.name = blockchain_1.PROTOCOL.APE_SWAP;
        this.chainType = constant_2.CHAIN_TYPE.EVM;
        this.chainId = blockchain_1.CHAIN_ID.MATIC;
        this.constants = ape_swap_constant_1.INFO[blockchain_1.CHAIN_ID.MATIC];
    }
    async getFarmsByAddress(farms, address) {
        return this._trackingFarmsByAddress(farms, address);
    }
    get provider() {
        return super.provider;
    }
    get farmName() {
        return this.constants.farm.name;
    }
    get farmAddress() {
        return this.constants.farm.address;
    }
    get farmAbi() {
        return this.addressABI.get(this.farmAddress);
    }
    get farmContract() {
        return new ethers_1.ethers.Contract(this.farmAddress, this.farmAbi, this.provider);
    }
    get farmRewarderName() {
        return this.constants.farm_rewarder.name;
    }
    get farmRewarderSampleAddress() {
        return this.constants.farm_rewarder.sample_address;
    }
    get farmRewarderAbi() {
        return this.addressABI.get(this.farmRewarderSampleAddress);
    }
    farmRewarderContract(address) {
        return new ethers_1.ethers.Contract(address, this.farmRewarderAbi, this.provider);
    }
    get farm2Name() {
        return this.constants.farm2.name;
    }
    get farm2Address() {
        return this.constants.farm2.address;
    }
    get farm2Abi() {
        return this.addressABI.get(this.farm2Address);
    }
    get farm2Contract() {
        return new ethers_1.ethers.Contract(this.farm2Address, this.farm2Abi, this.provider);
    }
    get farm2StratSampleAddress() {
        return this.constants.farm2_strat.sample_address;
    }
    get farm2StratAbi() {
        return this.addressABI.get(this.farm2StratSampleAddress);
    }
    farm2StratContract(address) {
        return new ethers_1.ethers.Contract(address, this.farm2StratAbi, this.provider);
    }
    get dexFactoryAddress() {
        return this.constants.dex.factory_address;
    }
    get dexFactoryInitCodeHash() {
        return this.constants.dex.factory_init_code_hash;
    }
    get dexFactoryAbi() {
        return this.addressABI.get(this.dexFactoryAddress);
    }
    get dexFactoryContract() {
        return new ethers_1.ethers.Contract(this.dexFactoryAddress, this.dexFactoryAbi, this.provider);
    }
    async getFarmTotalLength() {
        return this.farmContract.poolLength();
    }
    async getFarmTotalAllocPoint() {
        return this.farmContract.totalAllocPoint();
    }
    async getFarmRewardPerBlock() {
        return constant_1.ZERO;
    }
    async getFarmRewardPerSecond() {
        return this.farmContract.bananaPerSecond();
    }
    async getFarmRewarderRewardToken(address) {
        return this.farmRewarderContract(address).rewardToken();
    }
    async getFarmRewarderRewardPerSecond(address) {
        return this.farmRewarderContract(address).rewardPerSecond();
    }
    async getFarmInfos(pids) {
        const farmInfoEncode = pids.map((pid) => [
            [this.farmAddress, (0, encodeDecode_1.encodeFunction)(this.farmAbi, 'poolInfo', [pid])],
            [this.farmAddress, (0, encodeDecode_1.encodeFunction)(this.farmAbi, 'lpToken', [pid])],
            [this.farmAddress, (0, encodeDecode_1.encodeFunction)(this.farmAbi, 'rewarder', [pid])],
        ]);
        const farmInfoBatchCall = await (0, batch_contract_1.getBatchStaticAggregator)(this.provider, this.multiCallAddress, (0, array_1.flat)(farmInfoEncode));
        const farmInfoBatchCallMap = (0, array_1.toSplitWithChunkSize)(farmInfoBatchCall, 3);
        return farmInfoBatchCallMap.map((result) => {
            const [{ success: poolInfoSuccess, returnData: poolInfoData }, { success: lpTokenSuccess, returnData: lpTokenData }, { success: rewarderSuccess, returnData: rewarderData },] = result;
            const poolInfo = (0, encodeDecode_1.validResult)(poolInfoSuccess, poolInfoData)
                ? (0, encodeDecode_1.decodeFunctionResultData)(this.farmAbi, 'poolInfo', poolInfoData)
                : null;
            const lpToken = (0, encodeDecode_1.validResult)(lpTokenSuccess, lpTokenData)
                ? (0, encodeDecode_1.decodeFunctionResultData)(this.farmAbi, 'lpToken', lpTokenData)[0]
                : null;
            const rewarder = (0, encodeDecode_1.validResult)(rewarderSuccess, rewarderData)
                ? (0, encodeDecode_1.decodeFunctionResultData)(this.farmAbi, 'rewarder', rewarderData)[0]
                : null;
            if ((0, type_1.isNull)(poolInfo) || (0, type_1.isNull)(lpToken) || (0, type_1.isNull)(rewarder)) {
                return null;
            }
            return {
                allocPoint: poolInfo.allocPoint,
                lpToken,
                rewarder,
            };
        });
    }
    async getDEXFactoryTotalLength() {
        return this.dexFactoryContract.allPairsLength();
    }
    async getDEXFactoryInfos(pids) {
        const dexFactoryInfoEncode = pids.map((pid) => [
            this.dexFactoryAddress,
            (0, encodeDecode_1.encodeFunction)(this.dexFactoryAbi, 'allPairs', [pid]),
        ]);
        const dexFactoryInfoBatchCall = await (0, batch_contract_1.getBatchStaticAggregator)(this.provider, this.multiCallAddress, dexFactoryInfoEncode);
        return dexFactoryInfoBatchCall.map(({ success, returnData }) => {
            return (0, encodeDecode_1.validResult)(success, returnData)
                ? (0, encodeDecode_1.decodeFunctionResultData)(this.dexFactoryAbi, 'allPairs', returnData)[0]
                : [];
        });
    }
    async _trackingFarmsByAddress(farms, address) {
        if ((0, type_1.isUndefined)(farms))
            return [];
        const farmInfoEncode = farms.map(({ pid, data }) => {
            return [
                [
                    this.farmAddress,
                    (0, encodeDecode_1.encodeFunction)(this.farmAbi, 'userInfo', [pid, address]),
                ],
                [
                    this.farmAddress,
                    (0, encodeDecode_1.encodeFunction)(this.farmAbi, 'pendingBanana', [pid, address]),
                ],
                [
                    (0, object_1.get)(JSON.parse(data), 'rewarder'),
                    (0, encodeDecode_1.encodeFunction)(this.farmRewarderAbi, 'pendingTokens', [
                        pid,
                        address,
                        0,
                    ]),
                ],
            ];
        });
        const farmInfoBatchCall = await (0, batch_contract_1.getBatchStaticAggregator)(this.provider, this.multiCallAddress, (0, array_1.flat)(farmInfoEncode));
        const farmInfoBatchCallMap = (0, array_1.toSplitWithChunkSize)(farmInfoBatchCall, 3);
        const farmInfoZip = (0, array_1.zip)(farms, farmInfoBatchCallMap);
        return this._formatFarmResult(farmInfoZip);
    }
    async _formatFarmResult(farmInfoZip) {
        const output = [];
        await Promise.all(farmInfoZip.map(async ([farm, infoResult]) => {
            const { stakeTokens, rewardTokens, data } = farm;
            const rewarder = (0, object_1.get)(JSON.parse(data), 'rewarder');
            const [{ success: stakeAmountSuccess, returnData: stakeAmountData }, { success: pendingRewardSuccess, returnData: pendingRewardData }, { success: rewarderPendingRewardSuccess, returnData: rewarderPendingRewardData, },] = infoResult;
            const stakedAmountOfAddress = (0, encodeDecode_1.validResult)(stakeAmountSuccess, stakeAmountData)
                ? (0, encodeDecode_1.decodeFunctionResultData)(this.farmAbi, 'userInfo', stakeAmountData)
                    .amount
                : constant_1.ZERO;
            const rewardAmountOfAddress = (0, encodeDecode_1.validResult)(pendingRewardSuccess, pendingRewardData)
                ? (0, encodeDecode_1.decodeFunctionResultData)(this.farmAbi, 'pendingBanana', pendingRewardData)
                : constant_1.ZERO;
            const rewarderRewardAmountOfAddress = (0, encodeDecode_1.validResult)(rewarderPendingRewardSuccess, rewarderPendingRewardData)
                ? (0, encodeDecode_1.decodeFunctionResultData)(this.farmRewarderAbi, 'pendingTokens', rewarderPendingRewardData).rewardAmounts
                : constant_1.ZERO;
            if ((0, bignumber_1.isZero)(stakedAmountOfAddress) &&
                (0, bignumber_1.isZero)(rewardAmountOfAddress) &&
                (0, bignumber_1.isZero)(rewarderRewardAmountOfAddress)) {
                return;
            }
            farm.rewardTokens = this.sortByRewardTokens(rewardTokens, [
                this.token.address,
                await this.getFarmRewarderRewardToken(rewarder),
            ]);
            const { rewardTokens: sortedRewardTokens } = farm;
            const targetStakeToken = stakeTokens[0];
            const targetRewardToken = sortedRewardTokens[0];
            const targetRewarderRewardToken = sortedRewardTokens[1];
            const stakeAmount = (0, decimals_1.divideDecimals)(stakedAmountOfAddress, targetStakeToken.decimals);
            const rewardAmount = (0, decimals_1.divideDecimals)(rewardAmountOfAddress, targetRewardToken.decimals);
            const rewarderRewardAmount = (0, decimals_1.divideDecimals)(rewarderRewardAmountOfAddress, targetRewarderRewardToken.decimals);
            if ((0, bignumber_1.isZero)(stakeAmount) &&
                (0, bignumber_1.isZero)(rewardAmount) &&
                (0, bignumber_1.isZero)(rewarderRewardAmount)) {
                return;
            }
            farm.wallet = {
                stakeAmounts: [stakeAmount],
                rewardAmounts: [rewardAmount, rewarderRewardAmount],
            };
            output.push(farm);
        }));
        return output;
    }
};
ApeSwapMATICService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof network_service_1.NetworkService !== "undefined" && network_service_1.NetworkService) === "function" ? _a : Object, typeof (_b = typeof protocol_service_1.ProtocolService !== "undefined" && protocol_service_1.ProtocolService) === "function" ? _b : Object, typeof (_c = typeof token_service_1.TokenService !== "undefined" && token_service_1.TokenService) === "function" ? _c : Object, typeof (_d = typeof abi_service_1.AbiService !== "undefined" && abi_service_1.AbiService) === "function" ? _d : Object])
], ApeSwapMATICService);
exports.ApeSwapMATICService = ApeSwapMATICService;
//# sourceMappingURL=ape-swap.matic.service.js.map