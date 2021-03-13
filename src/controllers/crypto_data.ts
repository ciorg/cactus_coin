import CoinGeckoApi from '../utils/coingecko_api';
import Logger from '../utils/logger';
import * as I from '../interface';
import * as GeckoI from '../interfaces';

class CryptoData {
    logger: Logger;
    api: CoinGeckoApi;

    constructor() {
        this.api = new CoinGeckoApi();
        this.logger = new Logger();
    }

    async getCoinList(vs = 'usd', size = 100): Promise<I.Result> {
        const result: I.Result = {
            res: undefined
        };

        const data = await this.api.marketCapList({ vs, size });

        const preppedData = this._prepCoinListData(data);

        if (preppedData.length) {
            result.res = preppedData;
            return result;
        }

        result.error = true;
        return result;
    }

    async getCoinData(historyOpts: { id: string, unit: string, value: number }): Promise<I.Result> {
        const result: I.Result = {
            res: undefined
        };

        const formatedHistoryOpts = this._formatHistoryOpts(historyOpts);

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

    private _prepCoinListData(data: GeckoI.MarketCapListRes[]) {
        return data.map((coin: any) => {
            const info = {
                id: coin.id,
                name: coin.name,
                symbol: coin.symbol,
                price: coin.current_price,
                market_cap: coin.market_cap,
                change_per: coin.price_change_percentage_24h
            };

            return info;
        });
    }

    private _formatCoinMarketData(data: GeckoI.CoinDataRes) {
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
            exchanges: this._getCoinExchanges(data.tickers)
        }
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

    private _getCoinExchanges(tickers: GeckoI.CoinDataTickers[]) {
        const targets = [
            'btc',
            'usdt',
            'usd',
            'usdc',
            'eth',
            'xbt'
        ];

        const exchanges = tickers.reduce((exchanges: GeckoI.ExchangeInfo[], ticker) => {
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
    

    private _formatHistoryOpts(opts: I.CoinOpts): GeckoI.CoinMarketHistoryArgs {
        return {
            id: opts.id,
            vs: 'usd',
            days: this._makeDays(opts),
            interval: this._getInterval(opts)
        };
    }

    _makeDays(opts: I.CoinOpts) {
        if (opts.unit === 'years') {
            return opts.value * 365;
        }

        if (opts.unit === 'weeks') {
            return opts.value * 7;
        }

        if (opts.unit === 'months') {
            return opts.value * 30;
        }

        return opts.value;
    }

    private _getInterval(opts: I.CoinOpts): string {
        if (opts.unit === 'days' && opts.value === 1) {
            return 'minutely';
        }

        if ((opts.unit === 'days' && opts.value < 31)
            || (opts.unit === 'months' && opts.value < 2)
            || (opts.unit === 'weeks' && opts.value < 5)) {
            return 'hourly';
        }

        return 'daily';
    }
}

export = CryptoData;
