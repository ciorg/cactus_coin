import CoinGeckoApi from './coingecko_api';
import Logger from './logger';
import * as I from '../interfaces';

const logger = new Logger();

const cache: { [key: string]: any } = {};

const api = new CoinGeckoApi();

async function initializeCache(): Promise<void> {
    cache.markets = await api.marketCapList();
    console.log(cache.markets.length);
}

async function getMarketData(coinIds: string | undefined = undefined): Promise<I.MarketCapListRes[]> {
    if (coinIds) {
        return api.marketCapList(coinIds); 
    }

    if (cache.markets) {
        console.log('cached');
        console.log(cache.markets.length);
        return cache.markets;
    }

    console.log('not cached');
    return api.marketCapList();
}

export = {
    initializeCache,
    getMarketData
};
