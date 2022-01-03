"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeFiProtocolBase = void 0;
const typeorm_1 = require("typeorm");
const aggregator_base_1 = require("@seongeun/aggregator-base");
const type_1 = require("@seongeun/aggregator-util/lib/type");
class DeFiProtocolBase {
    constructor(networkService, protocolService, contractService) {
        this.networkService = networkService;
        this.protocolService = protocolService;
        this.contractService = contractService;
        this.isDeFiProtocolService = true;
        this.addressABI = new Map();
    }
    async onModuleInit() {
        this.network = await this.networkService.repository.findOneBy({
            chainType: this.chainType,
            chainId: this.chainId,
        });
        this.protocol = await this.protocolService.repository.findOneBy({
            name: this.name,
            network: this.network,
        });
        if ((0, type_1.isUndefined)(this.protocol)) {
            throw new Error('');
        }
        this.token = this.protocol.token;
        await this._injectABI();
    }
    get provider() {
        return this.networkService.provider(this.network.chainKey());
    }
    getBalance(address) {
        switch (this.chainType) {
            case aggregator_base_1.NETWORK_CHAIN_TYPE.EVM: {
                return this.provider.getBalance(address);
            }
        }
    }
    get blockTimeSecond() {
        return this.network.blockTimeSec;
    }
    get multiCallAddress() {
        return this.network.multiCallAddress;
    }
    get useFarm() {
        return this.protocol.useFarm;
    }
    get useLending() {
        return this.protocol.useLending;
    }
    get useDex() {
        return this.protocol.useDex;
    }
    get useNFT() {
        return this.protocol.useNFT;
    }
    async getBlockNumber() {
        switch (this.network.chainType) {
            case aggregator_base_1.NETWORK_CHAIN_TYPE.EVM: {
                return this.provider.getBlockNumber();
            }
        }
    }
    async _injectABI() {
        var e_1, _a;
        try {
            for (var _b = __asyncValues(Object.values(this.constants)), _c; _c = await _b.next(), !_c.done;) {
                const { address, sample_address, factory_address, bentoAddress, kashi_address, incentive_controller_address, a_token_sample_address, v_token_sample_address, s_token_sample_address, protocol_data_provider_address, } = _c.value;
                try {
                    const findABIAddress = [];
                    if (!(0, type_1.isUndefined)(address)) {
                        findABIAddress.push(address);
                    }
                    if (!(0, type_1.isUndefined)(sample_address)) {
                        findABIAddress.push(sample_address);
                    }
                    if (!(0, type_1.isUndefined)(factory_address)) {
                        findABIAddress.push(factory_address);
                    }
                    if (!(0, type_1.isUndefined)(a_token_sample_address)) {
                        findABIAddress.push(a_token_sample_address);
                    }
                    if (!(0, type_1.isUndefined)(s_token_sample_address)) {
                        findABIAddress.push(s_token_sample_address);
                    }
                    if (!(0, type_1.isUndefined)(v_token_sample_address)) {
                        findABIAddress.push(v_token_sample_address);
                    }
                    if (!(0, type_1.isUndefined)(bentoAddress)) {
                        findABIAddress.push(bentoAddress);
                    }
                    if (!(0, type_1.isUndefined)(kashi_address)) {
                        findABIAddress.push(kashi_address);
                    }
                    if (!(0, type_1.isUndefined)(incentive_controller_address)) {
                        findABIAddress.push(incentive_controller_address);
                    }
                    if (!(0, type_1.isUndefined)(protocol_data_provider_address)) {
                        findABIAddress.push(protocol_data_provider_address);
                    }
                    const contracts = await this.contractService.repository.findAllBy({
                        network: this.network,
                        address: (0, typeorm_1.In)(findABIAddress),
                    });
                    contracts.forEach((entity) => {
                        this.addressABI.set(entity.address, entity.getABI());
                    });
                }
                catch (e) {
                    throw new Error('Not found contract entity');
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
}
exports.DeFiProtocolBase = DeFiProtocolBase;
//# sourceMappingURL=defi-protocol-base.js.map