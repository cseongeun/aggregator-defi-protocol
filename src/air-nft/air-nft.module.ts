import { Module } from '@nestjs/common';
import { AbiModule } from '../../abi/abi.module';
import { NetworkModule } from '../../network/network.module';
import { ProtocolModule } from '../../protocol/protocol.module';
import { TokenModule } from '../../token/token.module';
import { AirNFTBSCService } from './air-nft.bsc.service';

@Module({
  imports: [NetworkModule, ProtocolModule, AbiModule, TokenModule],
  providers: [AirNFTBSCService],
  exports: [AirNFTBSCService],
})
export class AirNftModule {}
