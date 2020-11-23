import axios, { AxiosResponse } from 'axios';
import Logger from '../utils/logger';
import * as I from '../interface';

class CryptoData {
    base_url: string;
    logger: Logger;

    constructor() {
        this.base_url = 'https://api.coingecko.com/api/v3';
        this.logger = new Logger();
    }

    async getData(type: string) {
        
        const result: I.Result = {
            res: undefined
        };

       const data = await this._byMarketValue('usd');
        
        if (data) {
            result.res = data;
            return result;
        }

        result.error = true;
        return result;   
    }

    private async _byMarketValue(currency: string, size = 20) {
        const extention = '/coins/markets';

        const options = {
            responseType: 'json',
            params: {
                vs_currency: currency,
                order: 'market_cap_desc',
                per_page: size,
                page: 1,
                sparkline: false,
                price_change_percentage: '24h'
            }
        };

        const data = await this._getData(extention, options);

        if (data == null) return;

        return data.map((coin: any) => {
            const info = {
                name: coin.name,
                symbol: coin.symbol,
                price: coin.current_price,
                market_cap: coin.market_cap,
                change_per: coin.price_change_percentage_24h
            };

            return info;
        });
    }

    private async _getData(extention: string, options = {}) {
        try {
            const axiosRes = await this._apiCall(extention, options);

            if (axiosRes.status !== 200) {
                this.logger.error(`crypto api returned with ${axiosRes.status}`, {});
                return;
            }
            
            return axiosRes.data;
        } catch (e) {
            this.logger.error(e.message, e);
        }
    }

    private async _apiCall(extention: string, options = {}): Promise<AxiosResponse> {
        return axios.get(
            `${this.base_url}${extention}`,
            options
        );
    }
}

export = CryptoData;
