import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { KlaySwapKlaytnApiService } from './klaytn/klay-swap.klaytn.api.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [KlaySwapKlaytnApiService],
  exports: [KlaySwapKlaytnApiService],
})
export class KlaySwapApiModule {}
