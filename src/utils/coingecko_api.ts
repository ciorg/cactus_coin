import axios, { AxiosResponse } from 'axios';
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

    async marketCapList(args: I.marketCapListArgs) {
        const options = {
            vs_currency: args.vs,
            order: 'market_cap_desc',
            per_page: args.size,
            page: 1,
            sparkline: false,
            price_change_percentage: args.per_price_change || '24h'
        };

        const data = await this._getData('/coins/markets', options);

        if (data == null) return;

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

    coinData(id: string) {

    }

    priceHistory(id: string) {

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
