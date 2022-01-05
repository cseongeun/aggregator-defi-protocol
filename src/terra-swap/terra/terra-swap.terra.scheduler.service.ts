import { Injectable } from '@nestjs/common';
import { TerraSwapTerraBase } from './terra-swap.terra.base';

@Injectable()
export class TerraSwapTerraSchedulerService extends TerraSwapTerraBase {
  async getDexFactoryInfos(startAsset: any): Promise<{
    pairs: {
      asset_infos: any[];
      contract_addr: string;
      liquidity_token: string;
    }[];
  }> {
    return this.provider.wasm.contractQuery(this.dexFactory.address, {
      pairs: {
        start_after: startAsset,
        limit: 30,
      },
    });
  }
}
