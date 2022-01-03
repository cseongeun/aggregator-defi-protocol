"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FarmExtension = void 0;
const array_1 = require("@seongeun/aggregator-util/lib/array");
function FarmExtension(C) {
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
exports.FarmExtension = FarmExtension;
//# sourceMappingURL=extension.farm.js.map