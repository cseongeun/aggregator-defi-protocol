import { Farm, Lending, NFToken } from '@seongeun/aggregator-base/lib/entity';
import { ProtocolFarmResponseDTO } from './defi-protocol.dto';

/**
 * 팜 사용
 */
export interface IUseFarm {
  getFarmsByAddress(
    address: string,
    farms: Farm[],
  ): Promise<ProtocolFarmResponseDTO[]>;
}

/**
 * 렌딩 사용
 */
export interface IUseLending {
  getLendingsByAddress(address: string, lendings: Lending[]);
}

/**
 * NFT 사용
 */
export interface IUseNFT {
  getNFTokensByAddress(address: string, nfts: NFToken[]);
}
