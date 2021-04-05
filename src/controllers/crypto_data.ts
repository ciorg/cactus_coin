import CoinGeckoApi from '../utils/coingecko_api';
import CoinModel from '../models/coin';
import CategoriesModel from '../models/crypto_category';
import DbActions from '../utils/db_actions';
import Logger from '../utils/logger';
import cache from '../utils/gecko_cache';

import * as I from '../interfaces';

class CryptoData {
    logger: Logger;
    api: CoinGeckoApi;
    dbCoins: DbActions;
    dbCats: DbActions;
    cache: typeof cache;

    constructor() {
        this.cache = cache;
        this.api = new CoinGeckoApi();
        this.logger = new Logger();
        this.dbCoins = new DbActions(CoinModel);
        this.dbCats = new DbActions(CategoriesModel);
    }

    async getCoinList(): Promise<I.Result> {
        const result: I.Result = {
            res: undefined
        };

        const [prepped, categoryInfo] = await this._getMarketCapPageData();

        if (prepped.length) {
            result.res = {
                prepped,
                categoryInfo
            }
            return result;
        }

        result.error = true;
        return result;
    }

    async getCoinData(historyOpts: { id: string, unit: string, value: number }): Promise<I.Result> {
        const result: I.Result = {
            res: undefined
        };

        const marketData = await this.api.coinData(historyOpts.id);

        if (marketData) {
            const data = {
                market_data: this._formatCoinMarketData(marketData),
            };

            result.res = data;
            return result;
        }

        result.error = true;
        return result;
    }

    private async _prepCoinListData(data: I.MarketCapListRes[]) {
        const returnData = [];

        for (const coin of data) {
            const categories = await this._getCategories(coin.id);

            const info = {
                id: coin.id,
                name: coin.name,
                symbol: coin.symbol,
                price: coin.current_price,
                market_cap: coin.market_cap,
                change_per: coin.price_change_percentage_24h,
                categories
            };

            returnData.push(info);
        }

        return returnData;
    }

    async coinsByCat(category: string) {
        const result: I.Result = {
            res: undefined
        };
    
        const coinIds = await this._getCoinIdsInCategory(category);

        const [prepped, categoryInfo] = await this._getMarketCapPageData(coinIds);

        if (prepped.length) {
            result.res = {
                prepped,
                categoryInfo
            }
            return result;
        }

        result.error = true;

        return result;
    }

    async coinsByCatCode(code: string) {
        const result: I.Result = {
            res: undefined
        };
    
        const fullCatNames = await this._getCategoriesFromCode(code);

        const pResp = await Promise.all(fullCatNames.map((cat) => this._getCoinIdsInCategory(cat)));

        const coinIds = pResp.reduce((ids, id) => {
            if (id.length) id.forEach((id) => ids.push(id));

            return ids
        }, []);

        const [prepped, categoryInfo] = await this._getMarketCapPageData(coinIds);

        if (prepped.length) {
            result.res = {
                prepped,
                categoryInfo
            }
            return result;
        }

        result.error = true;

        return result;
    }

    private async _getMarketCapPageData(coinIdList: string[] = []) {
        let coinIds: string | undefined;
    
        if (coinIdList.length) {
            coinIds = coinIdList.join(',');
        }
    
        const data = await this.cache.getMarketData(coinIds);

        return Promise.all([
            this._prepCoinListData(data),
            this._getCategoryInfo()
        ]);
    }

    private async _getCategoriesFromCode(code: string): Promise<string[]> {
        const result = await this.dbCats.search('code', code);

        if (result.res.length > 0) {
            return result.res.map((res: any) => res.full);
        }

        return [];
    }

    private async _getCoinIdsInCategory(categories: string): Promise<string[]> {
        const result = await this.dbCoins.search('categories', categories);

        if (result.res.length === 0) return [];
    
        return result.res.map((res: any) => res.coin_id)
    }

    private async _getCategories(coin_id: string): Promise<string[]> {
        const result = await this.dbCoins.search('coin_id', coin_id);
        
        if (result.res.length > 0) {
            const { categories } = result.res[0]

            const pResp: string | null[] = await Promise.all(
                categories.map((cat: any) => this._getCodeFromCategory(cat))
            );

            return pResp.reduce((coinCats: string[], r: string | null) => {
                if (r != null && !coinCats.includes(r)) {
                    coinCats.push(r);
                }

                return coinCats;
            }, []);
        }

        return [];
    }

    private async _getCodeFromCategory(category: string): Promise<string | null> {
        const codeResult = await this.dbCats.search('key', this._normalizeCategory(category));

        if (codeResult.res.length) {
            return codeResult.res[0].code;
        }
        
        this.logger.info(`could not find code for ${category}`);

        return null;
    }

    private _normalizeCategory(category: string): string {
        return category.replace(/\s|\W/g, '');
    }

    private _formatCoinMarketData(data: I.CoinDataRes) {
        return {
            id: data.id,
            name: data.name,
            symbol: data.symbol.toUpperCase(),
            homepage: data.links.homepage[0],
            image: data.image.large,
            start_date: this._formatDate(data.genesis_date),
            current_price: this._formatNum(data.market_data.current_price.usd),
            ath: this._formatNum(data.market_data.ath.usd),
            ath_date: this._formatDate(data.market_data.ath_date.usd),
            market_cap: this._marketCap(data.market_data.market_cap.usd),
            rank: data.market_data.market_cap_rank,
            high_24h: this._formatNum(data.market_data.high_24h.usd), 
            low_24h: this._formatNum(data.market_data.low_24h.usd),
            categories: data.categories,
            description: data.description.en,
            exchanges: this._getCoinExchanges(data.tickers),
            max_supply: this._formatNum(this._getCoinSupply(data.market_data)),
            circulating_supply: this._formatNum(data.market_data.circulating_supply)
        }
    }

    private _getCoinSupply(market_data: I.CoinMarketData): number {
        const max = market_data.max_supply;
        const total = market_data.total_supply;

        if (max && total) {
            if (max > total) return max;
            return total;
        }

        if (max) return max;

        return total;
    }

    private _marketCap(value: number): string {
        const toString = Number(value).toFixed(0);
    
        const length = toString.length;
    
        if (length > 6 && length < 10) {
            return `${toString.slice(0, length - 6)} M`;
        }
    
        if (length > 9) {
            return `${toString.slice(0, length - 9)} B`;
        }
    
        return `${toString.slice(0, 3)} Th`;
    }

    private _getCoinExchanges(tickers: I.CoinDataTickers[]) {
        const targets = [
            'btc',
            'usdt',
            'usd',
            'usdc',
            'eth',
            'xbt'
        ];

        const exchanges = tickers.reduce((exchanges: I.ExchangeInfo[], ticker) => {
            if (ticker.trade_url && targets.includes(ticker.target.toLowerCase())) {
                const exData = {
                    ex_name: ticker.market.name,
                    target: ticker.target,
                    trust_score: ticker.trust_score,
                    trade_url: ticker.trade_url,
                    volume: this._formatNum(ticker.volume)
                }

                exchanges.push(exData);
            }

            return exchanges;
        }, []);

        return exchanges.sort((a, b) => Number(b.volume) - Number(a.volume));
    }

    private _formatDate(value: string): string {
        if (value) {
            const [year, month, date] = value.split('-');
        
            return `${month}/${date.split('T')[0]}/${year}`;
        }

        return 'na';
    }

    private _formatNum(value: number) {
        return Number(value).toLocaleString('en');
    }

    private async _getCategoryInfo() {
        const result = await this.dbCats.getAll();

        const catInfo = this._gatherCategories(result.res);

        return this._sortCategories(catInfo);
    }

    private _gatherCategories(catResponse: any[]): { [key: string]: string[] }  {
        const categories: { [key: string]: string[] } = {};

        if (catResponse.length) {
            for (const cat of catResponse) {
                if (categories[cat.code]) {
                    categories[cat.code].push(cat.full);
                    continue;
                }
    
                categories[cat.code] = [cat.full];
            }
        }

        return categories;
    }

    private _sortCategories(gatheredCats: { [key: string]: string[] }) {
        return Object.keys(gatheredCats).reduce((catArray: any, key) => {
            catArray.push([key, gatheredCats[key]]);
            return catArray;
        }, []).sort((a: string, b: string) => {
            if (a[0] < b[0]) return -1;
            if (a[0] > b[0]) return 1;
            return 0;
        });
    }
    
    // Still could be use full code for historical data one day
    // private _formatHistoryOpts(opts: I.CoinOpts): I.CoinMarketHistoryArgs {
    //     return {
    //         id: opts.id,
    //         vs: 'usd',
    //         days: this._makeDays(opts),
    //         interval: this._getInterval(opts)
    //     };
    // }

    // _makeDays(opts: I.CoinOpts) {
    //     if (opts.unit === 'years') {
    //         return opts.value * 365;
    //     }

    //     if (opts.unit === 'weeks') {
    //         return opts.value * 7;
    //     }

    //     if (opts.unit === 'months') {
    //         return opts.value * 30;
    //     }

    //     return opts.value;
    // }

    // private _getInterval(opts: I.CoinOpts): string {
    //     if (opts.unit === 'days' && opts.value === 1) {
    //         return 'minutely';
    //     }

    //     if ((opts.unit === 'days' && opts.value < 31)
    //         || (opts.unit === 'months' && opts.value < 2)
    //         || (opts.unit === 'weeks' && opts.value < 5)) {
    //         return 'hourly';
    //     }

    //     return 'daily';
    // }
}

export = CryptoData;
