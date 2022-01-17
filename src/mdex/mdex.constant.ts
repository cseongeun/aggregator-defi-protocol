import { NETWORK_CHAIN_ID } from '@seongeun/aggregator-base/lib/constant';

export const INFO = {
  [NETWORK_CHAIN_ID.BINANCE_SMART_CHAIN]: {
    farm: {
      name: 'mdex_binance-smart-chain_farm',
      address: '0xc48FE252Aa631017dF253578B1405ea399728A50',
    },
    dex: {
      factory_address: '0x3CD1C46068dAEa5Ebb0d3f55F6915B10648062B8',
      factory_init_code_hash:
        '0x0d994d996174b05cfc7bed897dc1b20b4c458fc8d64fe98bc78b3c64a6b4d093',
    },
  },
  [NETWORK_CHAIN_ID.HECO]: {
    farm: {
      name: 'mdex_heco_farm',
      address: '0xFB03e11D93632D97a8981158A632Dd5986F5E909',
    },
    dex: {
      factory_address: '0xb0b670fc1F7724119963018DB0BfA86aDb22d941',
      factory_init_code_hash:
        '0x2ad889f82040abccb2649ea6a874796c1601fb67f91a747a80e08860c73ddf24',
    },
  },
};
