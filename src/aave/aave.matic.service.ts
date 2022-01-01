import { Injectable } from '@nestjs/common';
import { BigNumber, Contract, ethers } from 'ethers';
import {
  NETWORK_CHAIN_ID,
  NETWORK_CHAIN_TYPE,
  PROTOCOL_NAME,
} from '@seongeun/aggregator-base/lib/constant';
import { ProtocolBase } from '../protocol-base';
import { ProtocolLending } from '../protocol-lending';
import { Lending } from '@seongeun/aggregator-base/lib/entity';
import { isZero } from '@seongeun/aggregator-util/lib/bignumber';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@seongeun/aggregator-util/lib/encodeDecode';
import { getBatchStaticAggregator } from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import { isNull, isUndefined } from '@seongeun/aggregator-util/lib/type';
import {
  flat,
  toSplitWithChunkSize,
  zip,
} from '@seongeun/aggregator-util/lib/array';
import { divideDecimals } from '@seongeun/aggregator-util/lib/decimals';
import {
  NetworkService,
  ProtocolService,
  TokenService,
  ContractService,
} from '@seongeun/aggregator-base/lib/service';
import { INFO } from './aave.constant';
import { get } from '@seongeun/aggregator-util/lib/object';
import { Provider } from '@ethersproject/providers';

@Injectable()
export class AaveMATICService extends ProtocolLending(ProtocolBase) {
  name = PROTOCOL_NAME.AAVE;
  chainType = NETWORK_CHAIN_TYPE.EVM;
  chainId = NETWORK_CHAIN_ID.MATIC;
  constants = INFO[NETWORK_CHAIN_ID.MATIC];

  constructor(
    public readonly networkService: NetworkService,
    public readonly protocolService: ProtocolService,
    public readonly tokenService: TokenService,
    public readonly contractService: ContractService,
  ) {
    super(networkService, protocolService, tokenService, contractService);
  }

  /***************************
   *  FOR ADDRESS
   ***************************/
  async getLendingsByAddress(
    lendings: Lending[],
    address: string,
  ): Promise<any> {
    return this._trackingLendingsByAddress(lendings, address);
  }

  /***************************
   *  ACCESSOR
   ***************************/
  get provider(): Provider {
    return super.provider as Provider;
  }

  get lendingAddress(): string {
    return this.constants.lending.address;
  }

  get lendingAbi(): any[] {
    return this.addressABI.get(this.lendingAddress);
  }

  get lendingContract(): Contract {
    return new ethers.Contract(
      this.lendingAddress,
      this.lendingAbi,
      this.provider,
    );
  }

  get aTokenSampleAddress(): string {
    return this.constants.lending.a_token_sample_address;
  }

  get aTokenAbi(): any[] {
    return this.addressABI.get(this.aTokenSampleAddress);
  }

  get vTokenSampleAddress(): string {
    return this.constants.lending.v_token_sample_address;
  }

  get vTokenAbi(): any[] {
    return this.addressABI.get(this.vTokenSampleAddress);
  }

  get sTokenSampleAddress(): string {
    return this.constants.lending.s_token_sample_address;
  }

  get sTokenAbi(): any[] {
    return this.addressABI.get(this.sTokenSampleAddress);
  }

  get lendingIncentiveAddress(): string {
    return this.constants.lending.incentive_controller_address;
  }

  get lendingIncentiveAbi(): any[] {
    return this.addressABI.get(this.lendingIncentiveAddress);
  }

  get lendingIncentiveContract(): Contract {
    return new ethers.Contract(
      this.lendingIncentiveAddress,
      this.lendingIncentiveAbi,
      this.provider,
    );
  }

  get lendingDataProviderAddress(): string {
    return this.constants.lending.protocol_data_provider_address;
  }

  get lendingDataProviderAbi(): any[] {
    return this.addressABI.get(this.lendingDataProviderAddress);
  }

  get lendingDataProviderContract(): Contract {
    return new ethers.Contract(
      this.lendingDataProviderAddress,
      this.lendingDataProviderAbi,
      this.provider,
    );
  }

  /***************************
   *  Public
   ***************************/
  async getLendingReserveList(): Promise<string[]> {
    return this.lendingContract.getReservesList();
  }

  async getLendingMarketInfos(reserves: string[]): Promise<
    {
      reserve: string;
      aTokenAddress: string;
      stableDebtTokenAddress: string;
      variableDebtTokenAddress: string;
      availableLiquidity: BigNumber;
      totalStableDebt: BigNumber;
      totalVariableDebt: BigNumber;
      liquidityRate: BigNumber;
      variableBorrowRate: BigNumber;
      stableBorrowRate: BigNumber;
      averageStableBorrowRate: BigNumber;
      liquidityIndex: BigNumber;
      variableBorrowIndex: BigNumber;
      lastUpdateTimestamp: number;
      decimals: BigNumber;
      ltv: BigNumber;
      liquidationThreshold: BigNumber;
      liquidationBonus: BigNumber;
      reserveFactor: BigNumber;
      usageAsCollateralEnabled: boolean;
      borrowingEnabled: boolean;
      stableBorrowRateEnabled: boolean;
      isActive: boolean;
      isFrozen: boolean;
    }[]
  > {
    const lendingMarketInfosEncode = this._lendingMarketEncodeData(reserves);

    const lendingMarketInfosBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      flat(lendingMarketInfosEncode),
    );

    const lendingMarketInfosBatchCallMap = toSplitWithChunkSize(
      lendingMarketInfosBatchCall,
      3,
    );

    const lendingMarketInfoZip = zip(reserves, lendingMarketInfosBatchCallMap);

    return this._lendingMarketResultData(lendingMarketInfoZip);
  }

  /***************************
   *  Private
   ***************************/
  private async _trackingLendingsByAddress(
    markets: Lending[],
    address: string,
  ) {
    if (isUndefined(markets)) return [];

    const lendingInfoEncode = markets.map(({ data }) => {
      const reserve = get(JSON.parse(data), 'reserve');

      return [
        this.lendingDataProviderAddress,
        encodeFunction(this.lendingDataProviderAbi, 'getUserReserveData', [
          reserve,
          address,
        ]),
      ];
    });

    const lendingInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      lendingInfoEncode,
    );

    const lendingInfoZip = zip(markets, lendingInfoBatchCall);

    return this._formatLendingMarketResult(lendingInfoZip);
  }

  private _formatLendingMarketResult(lendingMarketInfosZip: any) {
    const output = [];

    lendingMarketInfosZip.forEach(([market, result]) => {
      const { data } = market;

      const [aTokenDecimals, vTokenDecimals] = [
        get(JSON.parse(data), 'aTokenDecimals'),
        get(JSON.parse(data), 'vTokenDecimals'),
      ];

      const {
        success: userReserveDataSuccess,
        returnData: userReserveDataData,
      } = result;

      const userReserve = validResult(
        userReserveDataSuccess,
        userReserveDataData,
      )
        ? decodeFunctionResultData(
            this.lendingDataProviderAbi,
            'getUserReserveData',
            userReserveDataData,
          )
        : null;

      if (isNull(userReserve)) {
        return;
      }

      const { currentATokenBalance, currentVariableDebt } = userReserve;

      const supplyAmount = divideDecimals(currentATokenBalance, aTokenDecimals);
      const borrowAmount = divideDecimals(currentVariableDebt, vTokenDecimals);

      if (isZero(supplyAmount) && isZero(borrowAmount)) {
        return;
      }

      market.wallet = {
        supplyAmount: supplyAmount.toString(),
        borrowAmount: borrowAmount.toString(),
      };
      output.push(market);
    });

    return output;
  }

  private _lendingMarketEncodeData(reserves: string[]) {
    return reserves.map((address: string) => {
      return [
        [
          this.lendingDataProviderAddress,
          encodeFunction(
            this.lendingDataProviderAbi,
            'getReserveTokensAddresses',
            [address],
          ),
        ],
        [
          this.lendingDataProviderAddress,
          encodeFunction(this.lendingDataProviderAbi, 'getReserveData', [
            address,
          ]),
        ],
        [
          this.lendingDataProviderAddress,
          encodeFunction(
            this.lendingDataProviderAbi,
            'getReserveConfigurationData',
            [address],
          ),
        ],
      ];
    });
  }

  private _lendingMarketResultData(lendingMarketInfoZip: any) {
    return lendingMarketInfoZip.map(([reserve, lendingMarketInfoResult]) => {
      const [
        {
          success: reserveTokenAddressesSuccess,
          returnData: reserveTokenAddressesData,
        },
        { success: reserveDataSuccess, returnData: reserveDataData },
        {
          success: reserveConfigurationSuccess,
          returnData: reserveConfigurationData,
        },
      ] = lendingMarketInfoResult;

      const reserveTokenAddresses = validResult(
        reserveTokenAddressesSuccess,
        reserveTokenAddressesData,
      )
        ? decodeFunctionResultData(
            this.lendingDataProviderAbi,
            'getReserveTokensAddresses',
            reserveTokenAddressesData,
          )
        : null;

      const reserveData = validResult(reserveDataSuccess, reserveDataData)
        ? decodeFunctionResultData(
            this.lendingDataProviderAbi,
            'getReserveData',
            reserveDataData,
          )
        : null;

      const reserveConfig = validResult(
        reserveConfigurationSuccess,
        reserveConfigurationData,
      )
        ? decodeFunctionResultData(
            this.lendingDataProviderAbi,
            'getReserveConfigurationData',
            reserveConfigurationData,
          )
        : null;

      if (
        isNull(reserveTokenAddresses) ||
        isNull(reserveData) ||
        isNull(reserveConfig)
      ) {
        return null;
      }

      return {
        reserve,
        ...reserveTokenAddresses,
        ...reserveData,
        ...reserveConfig,
      };
    });
  }
}
