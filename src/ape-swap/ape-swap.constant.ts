import { NETWORK_CHAIN_ID } from '@seongeun/aggregator-base/lib/constant';

// https://apeswap.gitbook.io/apeswap-finance/smart-contracts
export const INFO = {
  [NETWORK_CHAIN_ID.BINANCE_SMART_CHAIN]: {
    farm: {
      name: 'farm',
      address: '0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9',
    },
    dex: {
      factory_address: '0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6',
      factory_init_code_hash:
        '0xf4ccce374816856d11f00e4069e7cada164065686fbef53c6167a63ec2fd8c5b',
    },
    nf_token: {
      address: '0x6eca7754007d22d3F557740d06FeD4A031BeFE1e',
    },
  },
  [NETWORK_CHAIN_ID.POLYGON]: {
    farm: {
      name: 'farm',
      address: '0x54aff400858Dcac39797a81894D9920f16972D1D',
    },
    farm_rewarder: {
      name: 'farm_rewarder',
      sample_address: '0x1F234B1b83e21Cb5e2b99b4E498fe70Ef2d6e3bf',
    },
    farm2: {
      name: 'farm2',
      address: '0x37ac7DE40A6fd71FD1559Aa00F154E8dcb72efdb',
    },
    farm2_strat: {
      name: 'farm2_strat',
      sample_address: '0x7c549eb3D46fb8105468aa455f846Bf5e6Cdb0E9',
    },
    dex: {
      factory_address: '0xCf083Be4164828f00cAE704EC15a36D711491284',
      factory_init_code_hash:
        '0x511f0f358fe530cda0859ec20becf391718fdf5a329be02f4c95361f3d6a42d8',
    },
  },
};
