import { Module } from '@nestjs/common';
import {
  ContractModule,
  NetworkModule,
  ProtocolModule,
} from '@seongeun/aggregator-base/lib/module';
import { AirNFTBSCService } from './air-nft.bsc.service';

@Module({
  imports: [NetworkModule, ProtocolModule, ContractModule],
  providers: [AirNFTBSCService],
  exports: [AirNFTBSCService],
})
export class AirNFTModule {}
