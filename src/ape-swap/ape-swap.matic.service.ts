import { Injectable } from '@nestjs/common';
import { BigNumber, Contract, ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import {
  PROTOCOL_NAME,
  NETWORK_CHAIN_ID,
  NETWORK_CHAIN_TYPE,
} from '@seongeun/aggregator-base/lib/constant';
import {
  ContractService,
  NetworkService,
  ProtocolService,
} from '@seongeun/aggregator-base/lib/service';
import { Farm } from '@seongeun/aggregator-base/lib/entity';
import { IContractInfo } from '@seongeun/aggregator-base/lib/contract/contract.interface';
import { isUndefined, isNull } from '@seongeun/aggregator-util/lib/type';
import {
  decodeFunctionResultData,
  encodeFunction,
  validResult,
} from '@seongeun/aggregator-util/lib/encodeDecode';
import { getBatchStaticAggregator } from '@seongeun/aggregator-util/lib/multicall/evm-contract';
import {
  flat,
  toSplitWithChunkSize,
  zip,
} from '@seongeun/aggregator-util/lib/array';
import { ZERO } from '@seongeun/aggregator-util/lib/constant';
import { isZero } from '@seongeun/aggregator-util/lib/bignumber';
import { divideDecimals } from '@seongeun/aggregator-util/lib/decimals';
import { INFO } from './ape-swap.constant';
import { BaseExtension } from '../extension/extension.base';
import { DexExtension } from '../extension/extension.dex';
import { FarmExtension } from '../extension/extension.farm';
import { get } from '@seongeun/aggregator-util/lib/object';

@Injectable()
export class ApeSwapMATICService extends FarmExtension(
  DexExtension(BaseExtension),
) {
  name = PROTOCOL_NAME.APE_SWAP;
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
  async getFarmsByAddress(farms: Farm[], address: string): Promise<any> {
    return this._trackingFarmsByAddress(farms, address);
  }

  /***************************
   *  ACCESSOR
   ***************************/
  get provider(): Provider {
    return super.provider as Provider;
  }

  get farm(): IContractInfo {
    const name = this.constants.farm.name;
    const address = this.constants.farm.address;
    const abi = this.addressABI.get(address);
    return {
      name,
      address,
      abi,
    };
  }

  get farmRewarder(): IContractInfo {
    const name = this.constants.farm_rewarder.name;
    const address = this.constants.farm_rewarder.sample_address;
    const abi = this.addressABI.get(address);
    return {
      name,
      address,
      abi,
    };
  }

  get farm2(): IContractInfo {
    const name = this.constants.farm2.name;
    const address = this.constants.farm2.address;
    const abi = this.addressABI.get(address);
    return {
      name,
      address,
      abi,
    };
  }

  get farm2Strat(): IContractInfo {
    const address = this.constants.farm2_strat.sample_address;
    const abi = this.addressABI.get(address);
    return {
      address,
      abi,
    };
  }

  get dexFactory(): IContractInfo {
    const address = this.constants.dex.factory_address;
    const abi = this.addressABI.get(address);
    const initCodeHash = this.constants.dex.factory_init_code_hash;
    return {
      address,
      abi,
      initCodeHash,
    };
  }

  get farmContract(): Contract {
    return new ethers.Contract(this.farm.address, this.farm.abi, this.provider);
  }

  farmRewarderContract(address: string): Contract {
    return new ethers.Contract(address, this.farmRewarder.abi, this.provider);
  }

  get farm2Contract(): Contract {
    return new ethers.Contract(
      this.farm2.address,
      this.farm2.abi,
      this.provider,
    );
  }

  farm2StratContract(address: string): Contract {
    return new ethers.Contract(address, this.farm2Strat.abi, this.provider);
  }

  get dexFactoryContract(): Contract {
    return new ethers.Contract(
      this.dexFactory.address,
      this.dexFactory.abi,
      this.provider,
    );
  }

  /***************************
   *  Public
   ***************************/
  async getFarmTotalLength(): Promise<BigNumber> {
    return this.farmContract.poolLength();
  }

  async getFarmTotalAllocPoint(): Promise<BigNumber> {
    return this.farmContract.totalAllocPoint();
  }

  async getFarmRewardPerBlock(): Promise<any> {
    return ZERO;
  }

  async getFarmRewardPerSecond(): Promise<BigNumber> {
    return this.farmContract.bananaPerSecond();
  }

  async getFarmRewarderRewardToken(address: string): Promise<string> {
    return this.farmRewarderContract(address).rewardToken();
  }

  async getFarmRewarderRewardPerSecond(address: string): Promise<BigNumber> {
    return this.farmRewarderContract(address).rewardPerSecond();
  }

  async getFarmInfos(pids: number[]): Promise<
    {
      lpToken: string;
      allocPoint: BigNumber;
      rewarder: string;
    }[]
  > {
    const farmInfoEncode = pids.map((pid: number) => [
      [this.farm.address, encodeFunction(this.farm.abi, 'poolInfo', [pid])],
      [this.farm.address, encodeFunction(this.farm.abi, 'lpToken', [pid])],
      [this.farm.address, encodeFunction(this.farm.abi, 'rewarder', [pid])],
    ]);

    const farmInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      flat(farmInfoEncode),
    );

    const farmInfoBatchCallMap = toSplitWithChunkSize(farmInfoBatchCall, 3);

    return farmInfoBatchCallMap.map((result) => {
      const [
        { success: poolInfoSuccess, returnData: poolInfoData },
        { success: lpTokenSuccess, returnData: lpTokenData },
        { success: rewarderSuccess, returnData: rewarderData },
      ] = result;

      const poolInfo = validResult(poolInfoSuccess, poolInfoData)
        ? decodeFunctionResultData(this.farm.abi, 'poolInfo', poolInfoData)
        : null;

      const lpToken = validResult(lpTokenSuccess, lpTokenData)
        ? decodeFunctionResultData(this.farm.abi, 'lpToken', lpTokenData)[0]
        : null;

      const rewarder = validResult(rewarderSuccess, rewarderData)
        ? decodeFunctionResultData(this.farm.abi, 'rewarder', rewarderData)[0]
        : null;

      if (isNull(poolInfo) || isNull(lpToken) || isNull(rewarder)) {
        return null;
      }

      return {
        allocPoint: poolInfo.allocPoint,
        lpToken,
        rewarder,
      };
    });
  }

  async getDEXFactoryTotalLength(): Promise<BigNumber> {
    return this.dexFactoryContract.allPairsLength();
  }

  async getDEXFactoryInfos(pids: number[]): Promise<string[]> {
    const dexFactoryInfoEncode = pids.map((pid: number) => [
      this.dexFactory.address,
      encodeFunction(this.dexFactory.abi, 'allPairs', [pid]),
    ]);

    const dexFactoryInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      dexFactoryInfoEncode,
    );

    return dexFactoryInfoBatchCall.map(({ success, returnData }) => {
      return validResult(success, returnData)
        ? decodeFunctionResultData(
            this.dexFactory.abi,
            'allPairs',
            returnData,
          )[0]
        : [];
    });
  }

  /***************************
   *  Private
   ***************************/
  private async _trackingFarmsByAddress(farms: Farm[], address: string) {
    if (isUndefined(farms)) return [];

    const farmInfoEncode = farms.map(({ pid, data }) => {
      return [
        [
          this.farm.address,
          encodeFunction(this.farm.abi, 'userInfo', [pid, address]),
        ],
        [
          this.farm.address,
          encodeFunction(this.farm.abi, 'pendingBanana', [pid, address]),
        ],
        [
          get(JSON.parse(data), 'rewarder'),
          encodeFunction(this.farmRewarder.abi, 'pendingTokens', [
            pid,
            address,
            0,
          ]),
        ],
      ];
    });

    const farmInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      flat(farmInfoEncode),
    );

    const farmInfoBatchCallMap: any[] = toSplitWithChunkSize(
      farmInfoBatchCall,
      3,
    );

    const farmInfoZip = zip(farms, farmInfoBatchCallMap);

    return this._formatFarmResult(farmInfoZip);
  }

  private async _formatFarmResult(farmInfoZip: any) {
    const output = [];

    await Promise.all(
      farmInfoZip.map(async ([farm, infoResult]) => {
        const { stakeTokens, rewardTokens, data } = farm;
        const rewarder = get(JSON.parse(data), 'rewarder');

        const [
          { success: stakeAmountSuccess, returnData: stakeAmountData },
          { success: pendingRewardSuccess, returnData: pendingRewardData },
          {
            success: rewarderPendingRewardSuccess,
            returnData: rewarderPendingRewardData,
          },
        ] = infoResult;

        const stakedAmountOfAddress = validResult(
          stakeAmountSuccess,
          stakeAmountData,
        )
          ? decodeFunctionResultData(this.farm.abi, 'userInfo', stakeAmountData)
              .amount
          : ZERO;

        const rewardAmountOfAddress = validResult(
          pendingRewardSuccess,
          pendingRewardData,
        )
          ? decodeFunctionResultData(
              this.farm.abi,
              'pendingBanana',
              pendingRewardData,
            )
          : ZERO;

        const rewarderRewardAmountOfAddress = validResult(
          rewarderPendingRewardSuccess,
          rewarderPendingRewardData,
        )
          ? decodeFunctionResultData(
              this.farmRewarder.abi,
              'pendingTokens',
              rewarderPendingRewardData,
            ).rewardAmounts
          : ZERO;

        if (
          isZero(stakedAmountOfAddress) &&
          isZero(rewardAmountOfAddress) &&
          isZero(rewarderRewardAmountOfAddress)
        ) {
          return;
        }

        farm.rewardTokens = this.sortByRewardTokens(rewardTokens, [
          this.token.address,
          await this.getFarmRewarderRewardToken(rewarder),
        ]);

        const { rewardTokens: sortedRewardTokens } = farm;

        const targetStakeToken = stakeTokens[0];
        const targetRewardToken = sortedRewardTokens[0];
        const targetRewarderRewardToken = sortedRewardTokens[1];

        const stakeAmount = divideDecimals(
          stakedAmountOfAddress,
          targetStakeToken.decimals,
        );

        const rewardAmount = divideDecimals(
          rewardAmountOfAddress,
          targetRewardToken.decimals,
        );

        const rewarderRewardAmount = divideDecimals(
          rewarderRewardAmountOfAddress,
          targetRewarderRewardToken.decimals,
        );

        if (
          isZero(stakeAmount) &&
          isZero(rewardAmount) &&
          isZero(rewarderRewardAmount)
        ) {
          return;
        }

        farm.wallet = {
          stakeAmounts: [stakeAmount],
          rewardAmounts: [rewardAmount, rewarderRewardAmount],
        };

        output.push(farm);
      }),
    );
    return output;
  }
}
