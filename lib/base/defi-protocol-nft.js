"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeFiProtocolNFT = void 0;
const evm_contract_1 = require("@seongeun/aggregator-util/lib/multicall/evm-contract");
const bignumber_1 = require("@seongeun/aggregator-util/lib/bignumber");
const array_1 = require("@seongeun/aggregator-util/lib/array");
const encodeDecode_1 = require("@seongeun/aggregator-util/lib/encodeDecode");
function DeFiProtocolNFT(C) {
    class Base extends C {
        constructor(...args) {
            super(...args);
        }
        async getNFTokenIndexesByAddress(address, nfTokenExtra, networkExtra) {
            const output = [];
            const balanceOf = await (0, evm_contract_1.getSafeERC721BalanceOf)(networkExtra.provider, networkExtra.multiCallAddress, nfTokenExtra.address, address);
            if ((0, bignumber_1.isZero)(balanceOf))
                return output;
            const tokenOfOwnerByIndexEncode = (0, array_1.fillSequenceNumber)(balanceOf).map((index) => [
                nfTokenExtra.address,
                (0, encodeDecode_1.encodeFunction)(nfTokenExtra.abi, 'tokenOfOwnerByIndex', [
                    address,
                    index,
                ]),
            ]);
            const tokenOfOwnerByIndexBatchCall = await (0, evm_contract_1.getBatchStaticAggregator)(networkExtra.provider, networkExtra.multiCallAddress, tokenOfOwnerByIndexEncode);
            tokenOfOwnerByIndexBatchCall.forEach(({ success, returnData }) => {
                if ((0, encodeDecode_1.validResult)(success, returnData)) {
                    const index = (0, encodeDecode_1.decodeFunctionResultData)(nfTokenExtra.abi, 'tokenOfOwnerByIndex', returnData)[0];
                    output.push(Number(index.toString()));
                }
            });
            return output;
        }
    }
    return Base;
}
exports.DeFiProtocolNFT = DeFiProtocolNFT;
//# sourceMappingURL=defi-protocol-nft.js.map