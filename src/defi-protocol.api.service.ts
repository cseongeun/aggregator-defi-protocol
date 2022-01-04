import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { isUndefined } from '@seongeun/aggregator-util/lib/type';
import { DefiProtocolApiModule } from './defi-protocol.api.module';

@Injectable()
export class DeFiProtocolApiService implements OnModuleInit {
  service = new Map<number, any>();

  constructor(private readonly moduleRef: ModuleRef) {}

  /**
   * defi 모듈 내 하위 폴더의 export defi service <instance by id>
   */
  async onModuleInit(): Promise<void> {
    const imports = Reflect.getMetadata('imports', DefiProtocolApiModule);
    for (const importModule of imports) {
      const exportModules = Reflect.getMetadata('exports', importModule);

      if (exportModules.length > 0) {
        for (const exportModule of exportModules) {
          const serviceInstance = this.moduleRef.get(exportModule, {
            strict: false,
          });

          const isDeFiService = serviceInstance.isDeFiProtocolService;

          if (!isDeFiService || isUndefined(isDeFiService)) {
            continue;
          }

          const { protocol } = serviceInstance;

          this.service.set(protocol.id, serviceInstance);
        }
      }
    }
  }

  getService(id: number) {
    return this.service.get(id);
  }
}
