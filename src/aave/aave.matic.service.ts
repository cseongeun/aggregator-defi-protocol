import { Injectable } from '@nestjs/common';
import { BigNumber, Contract, ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import {
  NETWORK_CHAIN_ID,
  PROTOCOL_NAME,
  NETWORK_CHAIN_TYPE,
} from '@seongeun/aggregator-base/lib/constant';
import { Lending } from '@seongeun/aggregator-base/lib/entity';
import {
  NetworkService,
  ProtocolService,
  ContractService,
} from '@seongeun/aggregator-base/lib/service';
import { IContractInfo } from '@seongeun/aggregator-base/lib/interface';
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
import { get } from '@seongeun/aggregator-util/lib/object';
import { BaseExtension } from '../extension/extension.base';
import { LendingExtension } from '../extension/extension.lending';
import { INFO } from './aave.constant';

@Injectable()
export class AaveMATICService extends LendingExtension(BaseExtension) {
  name = PROTOCOL_NAME.AAVE;
  chainType = NETWORK_CHAIN_TYPE.EVM;
  chainId = NETWORK_CHAIN_ID.MATIC;
  constants = INFO[NETWORK_CHAIN_ID.MATIC];

  constructor(
    public readonly networkService: NetworkService,
    public readonly protocolService: ProtocolService,
    public readonly contractService: ContractService,
  ) {
    super(networkService, protocolService, contractService);
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

  get lending(): IContractInfo {
    const address = this.constants.lending.address;
    const abi = this.addressABI.get(address);
    return {
      address,
      abi,
    };
  }

  get aToken(): IContractInfo {
    const address = this.constants.lending.a_token_sample_address;
    const abi = this.addressABI.get(address);
    return {
      address,
      abi,
    };
  }

  get vToken(): IContractInfo {
    const address = this.constants.lending.v_token_sample_address;
    const abi = this.addressABI.get(address);
    return {
      address,
      abi,
    };
  }

  get sToken(): IContractInfo {
    const address = this.constants.lending.s_token_sample_address;
    const abi = this.addressABI.get(address);
    return {
      address,
      abi,
    };
  }

  get lendingIncentiveController(): IContractInfo {
    const address = this.constants.lending.incentive_controller_address;
    const abi = this.addressABI.get(address);
    return {
      address,
      abi,
    };
  }

  get lendingDataProvider(): IContractInfo {
    const address = this.constants.lending.protocol_data_provider_address;
    const abi = this.addressABI.get(address);
    return {
      address,
      abi,
    };
  }

  get lendingContract(): Contract {
    return new ethers.Contract(
      this.lending.address,
      this.lending.abi,
      this.provider,
    );
  }

  get lendingIncentiveContract(): Contract {
    return new ethers.Contract(
      this.lendingIncentiveController.address,
      this.lendingIncentiveController.abi,
      this.provider,
    );
  }

  get lendingDataProviderContract(): Contract {
    return new ethers.Contract(
      this.lendingDataProvider.address,
      this.lendingDataProvider.abi,
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
        this.lendingDataProvider.address,
        encodeFunction(this.lendingDataProvider.abi, 'getUserReserveData', [
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
            this.lendingDataProvider.abi,
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
          this.lendingDataProvider.address,
          encodeFunction(
            this.lendingDataProvider.abi,
            'getReserveTokensAddresses',
            [address],
          ),
        ],
        [
          this.lendingDataProvider.address,
          encodeFunction(this.lendingDataProvider.abi, 'getReserveData', [
            address,
          ]),
        ],
        [
          this.lendingDataProvider.address,
          encodeFunction(
            this.lendingDataProvider.abi,
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
            this.lendingDataProvider.abi,
            'getReserveTokensAddresses',
            reserveTokenAddressesData,
          )
        : null;

      const reserveData = validResult(reserveDataSuccess, reserveDataData)
        ? decodeFunctionResultData(
            this.lendingDataProvider.abi,
            'getReserveData',
            reserveDataData,
          )
        : null;

      const reserveConfig = validResult(
        reserveConfigurationSuccess,
        reserveConfigurationData,
      )
        ? decodeFunctionResultData(
            this.lendingDataProvider.abi,
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
