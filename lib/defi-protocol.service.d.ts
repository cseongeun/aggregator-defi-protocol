import { OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
export declare class DeFiProtocolService implements OnModuleInit {
    private readonly moduleRef;
    service: Map<number, any>;
    constructor(moduleRef: ModuleRef);
    onModuleInit(): Promise<void>;
    getService(id: number): any;
}
