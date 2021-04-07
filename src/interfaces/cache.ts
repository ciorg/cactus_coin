import { MarketCapListRes } from './coin_gecko_api'

export interface Cache {
    coin_expiration: number
}

export interface CacheMarketsResponse {
    data: MarketCapListRes[];
    cache_time: Date;
}