import { NETWORK_CHAIN_ID } from '@seongeun/aggregator-base/lib/constant';

export const INFO = {
  [NETWORK_CHAIN_ID.POLYGON]: {
    farm: {
      name: 'farm',
      sample_address: '0x14977e7E263FF79c4c3159F497D9551fbE769625',
      factory_address: '0x9Dd12421C637689c3Fc6e661C9e2f02C2F61b3Eb',
    },
    farm2: {
      name: 'farm2',
      sample_address: '0x45a5CB25F3E3bFEe615F6da0731740093F59b768',
      factory_address: '0x8aAA5e259F74c8114e0a471d9f2ADFc66Bfe09ed',
    },
    dex: {
      factory_address: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
      factory_init_code_hash:
        '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
    },
  },
};
