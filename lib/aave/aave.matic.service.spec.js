"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_module_1 = require("../extension/testing/test.module");
const providers_1 = require("@ethersproject/providers");
const aave_matic_service_1 = require("./aave.matic.service");
describe('AaveMATICService', () => {
    const testModule = new test_module_1.TestModule();
    let app;
    let service;
    beforeAll(async () => {
        app = await testModule.createTestModule();
        service = app.get(aave_matic_service_1.AaveMATICService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('Accessor', () => {
        it('provider', async () => {
            expect(service.provider).toBeInstanceOf(providers_1.Provider);
        });
        it('lending', async () => {
            expect(service.lending).toBeCalledWith(expect.objectContaining({
                address: expect.any(String),
                abi: expect.any(Object),
            }));
        });
    });
    describe('Public', () => {
        it('getLendingReserveList', async () => {
            const reserveList = await service.getLendingReserveList();
            expect(Array.isArray(reserveList)).toBe(true);
        });
        it('getLendingMarketInfos', async () => {
            const reserveList = await service.getLendingReserveList();
            const marketInfos = await service.getLendingMarketInfos(reserveList);
            expect(marketInfos[0]).toHaveProperty('reserve');
            expect(marketInfos[0]).toHaveProperty('aTokenAddress');
            expect(marketInfos[0]).toHaveProperty('stableDebtTokenAddress');
            expect(marketInfos[0]).toHaveProperty('variableDebtTokenAddress');
            expect(marketInfos[0]).toHaveProperty('availableLiquidity');
            expect(marketInfos[0]).toHaveProperty('totalStableDebt');
            expect(marketInfos[0]).toHaveProperty('liquidityRate');
            expect(marketInfos[0]).toHaveProperty('variableBorrowRate');
            expect(marketInfos[0]).toHaveProperty('stableBorrowRate');
            expect(marketInfos[0]).toHaveProperty('averageStableBorrowRate');
            expect(marketInfos[0]).toHaveProperty('liquidityIndex');
            expect(marketInfos[0]).toHaveProperty('variableBorrowIndex');
            expect(marketInfos[0]).toHaveProperty('lastUpdateTimestamp');
            expect(marketInfos[0]).toHaveProperty('decimals');
            expect(marketInfos[0]).toHaveProperty('ltv');
            expect(marketInfos[0]).toHaveProperty('liquidationThreshold');
            expect(marketInfos[0]).toHaveProperty('liquidationBonus');
            expect(marketInfos[0]).toHaveProperty('reserveFactor');
            expect(marketInfos[0]).toHaveProperty('usageAsCollateralEnabled');
            expect(marketInfos[0]).toHaveProperty('borrowingEnabled');
            expect(marketInfos[0]).toHaveProperty('stableBorrowRateEnabled');
            expect(marketInfos[0]).toHaveProperty('isActive');
            expect(marketInfos[0]).toHaveProperty('isFrozen');
        });
    });
});
//# sourceMappingURL=aave.matic.service.spec.js.map