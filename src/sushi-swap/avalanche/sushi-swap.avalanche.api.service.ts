import { Injectable } from '@nestjs/common';
import { SushiSwapAvalancheBase } from './sushi-swap.avalanche.base';

@Injectable()
export class SushiSwapAvalancheApiService extends SushiSwapAvalancheBase {}
