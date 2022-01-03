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
exports.ApeSwapBSCService = void 0;
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
const constant_1 = require("@seongeun/aggregator-base/lib/constant");
const service_1 = require("@seongeun/aggregator-base/lib/service");
const type_1 = require("@seongeun/aggregator-util/lib/type");
const encodeDecode_1 = require("@seongeun/aggregator-util/lib/encodeDecode");
const evm_contract_1 = require("@seongeun/aggregator-util/lib/multicall/evm-contract");
const array_1 = require("@seongeun/aggregator-util/lib/array");
const constant_2 = require("@seongeun/aggregator-util/lib/constant");
const bignumber_1 = require("@seongeun/aggregator-util/lib/bignumber");
const decimals_1 = require("@seongeun/aggregator-util/lib/decimals");
const ape_swap_constant_1 = require("./ape-swap.constant");
const extension_base_1 = require("../extension/extension.base");
const extension_dex_1 = require("../extension/extension.dex");
const extension_farm_1 = require("../extension/extension.farm");
const extension_nft_1 = require("../extension/extension.nft");
let ApeSwapBSCService = class ApeSwapBSCService extends (0, extension_farm_1.FarmExtension)((0, extension_nft_1.NFTExtension)((0, extension_dex_1.DexExtension)(extension_base_1.BaseExtension))) {
    constructor(networkService, protocolService, contractService) {
        super(networkService, protocolService, contractService);
        this.networkService = networkService;
        this.protocolService = protocolService;
        this.contractService = contractService;
        this.name = constant_1.PROTOCOL_NAME.APE_SWAP;
        this.chainType = constant_1.NETWORK_CHAIN_TYPE.EVM;
        this.chainId = constant_1.NETWORK_CHAIN_ID.BSC;
        this.constants = ape_swap_constant_1.INFO[constant_1.NETWORK_CHAIN_ID.BSC];
    }
    async getFarmsByAddress(farms, address) {
        return this._trackingFarmsByAddress(farms, address);
    }
    async getNFTokensByAddress(address) {
        return this._trackingNFTokensByAddress(address);
    }
    get provider() {
        return super.provider;
    }
    get farm() {
        const name = this.constants.farm.name;
        const address = this.constants.farm.address;
        const abi = this.addressABI.get(address);
        return {
            name,
            address,
            abi,
        };
    }
    get dexFactory() {
        const address = this.constants.dex.factory_address;
        const abi = this.addressABI.get(address);
        const initCodeHash = this.constants.dex.factory_init_code_hash;
        return {
            address,
            abi,
            initCodeHash,
        };
    }
    get nfToken() {
        const address = this.constants.nf_token.address;
        const abi = this.addressABI.get(address);
        return {
            address,
            abi,
        };
    }
    get farmContract() {
        return new ethers_1.ethers.Contract(this.farm.address, this.farm.abi, this.provider);
    }
    get dexFactoryContract() {
        return new ethers_1.ethers.Contract(this.dexFactory.address, this.dexFactory.abi, this.provider);
    }
    get nfTokenContract() {
        return new ethers_1.ethers.Contract(this.nfToken.address, this.nfToken.abi, this.provider);
    }
    async getFarmTotalLength() {
        return this.farmContract.poolLength();
    }
    async getFarmTotalAllocPoint() {
        return this.farmContract.totalAllocPoint();
    }
    async getFarmRewardPerBlock() {
        return this.farmContract.cakePerBlock();
    }
    async getFarmInfos(pids) {
        const farmInfoEncode = pids.map((pid) => [
            this.farm.address,
            (0, encodeDecode_1.encodeFunction)(this.farm.abi, 'poolInfo', [pid]),
        ]);
        const farmInfoBatchCall = await (0, evm_contract_1.getBatchStaticAggregator)(this.provider, this.multiCallAddress, farmInfoEncode);
        return farmInfoBatchCall.map(({ success, returnData }) => {
            return (0, encodeDecode_1.validResult)(success, returnData)
                ? (0, encodeDecode_1.decodeFunctionResultData)(this.farm.abi, 'poolInfo', returnData)
                : [];
        });
    }
    async getDEXFactoryTotalLength() {
        return this.dexFactoryContract.allPairsLength();
    }
    async getDEXFactoryInfos(pids) {
        const dexFactoryInfoEncode = pids.map((pid) => [
            this.dexFactory.address,
            (0, encodeDecode_1.encodeFunction)(this.dexFactory.abi, 'allPairs', [pid]),
        ]);
        const dexFactoryInfoBatchCall = await (0, evm_contract_1.getBatchStaticAggregator)(this.provider, this.multiCallAddress, dexFactoryInfoEncode);
        return dexFactoryInfoBatchCall.map(({ success, returnData }) => {
            return (0, encodeDecode_1.validResult)(success, returnData)
                ? (0, encodeDecode_1.decodeFunctionResultData)(this.dexFactory.abi, 'allPairs', returnData)[0]
                : [];
        });
    }
    async getNFTokenTotalSupply() {
        return this.nfTokenContract.totalSupply();
    }
    async getNFTokenInfos(pids) {
        return (0, evm_contract_1.getBatchERC721TokenInfos)(this.provider, this.multiCallAddress, this.nfToken.address, pids);
    }
    async _trackingFarmsByAddress(farms, address) {
        if ((0, type_1.isUndefined)(farms))
            return [];
        const farmInfoEncode = farms.map(({ pid }) => {
            return [
                [
                    this.farm.address,
                    (0, encodeDecode_1.encodeFunction)(this.farm.abi, 'userInfo', [pid, address]),
                ],
                [
                    this.farm.address,
                    (0, encodeDecode_1.encodeFunction)(this.farm.abi, 'pendingCake', [pid, address]),
                ],
            ];
        });
        const farmInfoBatchCall = await (0, evm_contract_1.getBatchStaticAggregator)(this.provider, this.multiCallAddress, (0, array_1.flat)(farmInfoEncode));
        const farmInfoBatchCallMap = (0, array_1.toSplitWithChunkSize)(farmInfoBatchCall, 2);
        const farmInfoZip = (0, array_1.zip)(farms, farmInfoBatchCallMap);
        return this._formatFarmResult(farmInfoZip);
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
    _formatFarmResult(farmInfoZip) {
        const output = [];
        farmInfoZip.forEach(([farm, infoResult]) => {
            const { stakeTokens, rewardTokens } = farm;
            const [{ success: stakeAmountSuccess, returnData: stakeAmountData }, { success: pendingRewardSuccess, returnData: pendingRewardData },] = infoResult;
            const stakedAmountOfAddress = (0, encodeDecode_1.validResult)(stakeAmountSuccess, stakeAmountData)
                ? (0, encodeDecode_1.decodeFunctionResultData)(this.farm.abi, 'userInfo', stakeAmountData)
                    .amount
                : constant_2.ZERO;
            const rewardAmountOfAddress = (0, encodeDecode_1.validResult)(pendingRewardSuccess, pendingRewardData)
                ? (0, encodeDecode_1.decodeFunctionResultData)(this.farm.abi, 'pendingCake', pendingRewardData)
                : constant_2.ZERO;
            if ((0, bignumber_1.isZero)(stakedAmountOfAddress) && (0, bignumber_1.isZero)(rewardAmountOfAddress)) {
                return;
            }
            const targetStakeToken = stakeTokens[0];
            const targetRewardToken = rewardTokens[0];
            const stakeAmount = (0, decimals_1.divideDecimals)(stakedAmountOfAddress, targetStakeToken.decimals);
            const rewardAmount = (0, decimals_1.divideDecimals)(rewardAmountOfAddress, targetRewardToken.decimals);
            if ((0, bignumber_1.isZero)(stakeAmount) && (0, bignumber_1.isZero)(rewardAmount)) {
                return;
            }
            farm.wallet = {
                stakeAmounts: [stakeAmount],
                rewardAmounts: [rewardAmount],
            };
            output.push(farm);
        });
        return output;
    }
};
ApeSwapBSCService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [service_1.NetworkService,
        service_1.ProtocolService,
        service_1.ContractService])
], ApeSwapBSCService);
exports.ApeSwapBSCService = ApeSwapBSCService;
//# sourceMappingURL=ape-swap.bsc.service.js.map