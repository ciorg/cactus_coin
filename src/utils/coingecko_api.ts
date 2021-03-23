import axios from 'axios';
import Configs from './configs';
import Logger from './logger';
import * as I from '../interfaces';


class CoinGeckoApi {
    configs: I.CoinGecko;
    base_url: string;
    logger: Logger;

    constructor() {
        this.logger = new Logger();
        
        this.configs = new Configs().getCoinGeckConfigs();
        this.base_url = this.configs.base_url;
    }

    async marketCapListLarge(args: I.MarketCapListArgs): Promise<I.MarketCapListRes[]> {
        const perPage = args.per_page || 100;
    
        const requests = Math.ceil(args.size / perPage);

        const optionArray = [];

        for (let i = 1; i <= requests; i++) {
            const options = {
                vs_currency: args.vs,
                order: 'market_cap_desc',
                per_page: perPage,
                page: i,
                sparkline: false,
                price_change_percentage: args.per_price_change || '24h'
            };

            optionArray.push(options);
        }

        const marketDataArray: I.MarketCapListRes[][] = await Promise.all(
            optionArray.map((opt) => this._getData('/coins/markets', opt))
        );


        const data = marketDataArray.reduce((flat, res) => {
            if (res.length > 0) {
                res.forEach((r) => flat.push(r))
            }
    
            return flat
        }, []);
        
        return data;
    }

    async marketCapListSmall(args: I.MarketCapListArgs, list: undefined | string) {
        const perPage = args.per_page || 100;

        const options: any = {
            vs_currency: args.vs,
            order: 'market_cap_desc',
            per_page: perPage,
            page: 100,
            sparkline: false,
            price_change_percentage: args.per_price_change || '24h'
        };

        if (list) {
            options.ids = list;
        }

        return this._getData('/coins/markets', options);
    }

    async coinData(symbol: string): Promise<I.CoinDataRes | null> {
        const marketOpts = {
            id: symbol,
            localization: false,
            tickers: true,
            market_data: true,
            community_data: false,
            developer_data: false,
            sparkline: false
        }

        const data = await this._getData(`/coins/${symbol}`, marketOpts);

        if (data == null) return null;

        return data;
    }

    async coinMarketHistory(args: I.CoinMarketHistoryArgs): Promise<I.CoinMarketHistoryResp | null> {
        const opts = {
            id: args.id,
            vs_currency: args.vs,
            days: args.days,
            interval: args.interval
        };

        const data = await this._getData(`/coins/${opts.id}/market_chart`, opts);

        if (data == null) return null;

        return data;
    }

    private async _getData(extention: string, options = {}) {
        try {
            const res = await axios.get(
                `${this.base_url}${extention}`,
                {
                    params: options
                }
            );
           
            if (res.status !== 200) {
                this.logger.error(`crypto api returned with ${res.status}`, {});
                return;
            }
            
            return res.data;
        } catch (e) {
            this.logger.error(e.message, e);
        }
    }

}

export = CoinGeckoApi;
