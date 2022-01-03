"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeFiProtocolFarm = void 0;
const array_1 = require("@seongeun/aggregator-util/lib/array");
function DeFiProtocolFarm(C) {
    class Base extends C {
        constructor(...args) {
            super(...args);
        }
        sortByRewardTokens(tokens, sortByAddress) {
            return (0, array_1.flat)(sortByAddress.map((sort) => tokens.filter(({ address }) => address === sort)));
        }
    }
    return Base;
}
exports.DeFiProtocolFarm = DeFiProtocolFarm;
//# sourceMappingURL=defi-protocol-farm.js.map