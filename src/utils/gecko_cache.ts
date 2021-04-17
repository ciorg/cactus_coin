import CoinGeckoApi from './coingecko_api';
import Logger from './logger';
import Configs from './configs';
import * as I from '../interfaces';

const logger = new Logger();
const cacheConfig = new Configs().getCacheConfigs();

const cache: { [key: string]: any } = {};

const api = new CoinGeckoApi();

async function initializeCache(): Promise<void> {
    logger.info('inializing cache for marketcaps')
    await setMarketData();
    updateMarketCaps();
}

async function getMarketData(coinIds: string | undefined = undefined): Promise<I.CacheMarketsResponse> {
    if (coinIds) {
        const coinList = await api.marketCapList(coinIds);

        return {
            data: coinList,
            cache_time: new Date()
        };
    }

    return cache.markets;
}

async function setMarketData(): Promise<void> {
    const data = await api.marketCapList();
    
    cache.markets = {
        data,
        cache_time: new Date()
    };

    logger.info(`updated market caps`);
}

async function updateMarketCaps(): Promise<void> {
    setInterval(() => {
        logger.info('updating market cap cache');
        setMarketData();
    }, cacheConfig.update_market_caps);
}

async function getCoinData(id: string) {
    if (cache[id] && !_expired(cache[id].cache_time)) {
        return cache[id];
    }

    logger.info(`${id} cache expired or not cached`);

    const data = await api.coinData(id);

    cache[id] = {
        data,
        cache_time: new Date()
    };

    return data;
}

function _expired(cacheTime: Date): boolean {
    return new Date().getTime() - cacheTime.getTime() < cacheConfig.coin_expiration;
}

export = {
    initializeCache,
    getMarketData,
    getCoinData
};
