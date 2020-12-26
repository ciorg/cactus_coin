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

    async coin(symbol: string, days: number) {
        // all time high /coins/{id}
        // ath date /coins/{id}
        // atl /coins/{id}
        // atl date /coins/{id}
        // 24 hr high /coins/markets
        // 24 hr low /coins/markets
        // max supply /coins/markets
        // circulating supply /coins/markets
        // 52 week high
        // 52 week low
        // time series price last 7 days
        // start day /coins/{id}
        // link to site /coins/{id}
        // image /coins/markets
        // marketcap /coins/markets
        // marketcap rank /coins/markets
        // current price  /coins/markets
        // 30, 60, 90, yr % change /coins/{id}
        // 30 days by hour

        const result: I.Result = {
            res: undefined
        }
        
        const marketData = await this.coinMarket(symbol);
        const priceHistory = await this.coinHistory(symbol, days);

        if (marketData && priceHistory) {
            result.res = {
                market_data: marketData,
                price_history: priceHistory
            }

            return result;
        }

        result.error = true;

        return result;
    }

    private async coinMarket(symbol: string): Promise<I.CoinMarketData> {
        const marketOpts = {
            id: symbol,
            localization: false,
            tickers: false,
            market_data: true,
            community_data: false,
            developer_data: false,
            sparkline: false
        }

        const extention = `/coins/${symbol}`;

        const data = await this._getData(extention, marketOpts);

        return {
            name: data.name,
            symbol: data.symbol,
            homepage: data.links.homepage[0],
            image: data.image.large,
            start_date: data.genesis_date,
            current_price: data.market_data.current_price.usd,
            ath: data.market_data.ath.usd,
            ath_date: data.market_data.ath_date.usd,
            market_cap: data.market_data.market_cap.usd,
            rank: data.market_data.market_cap_rank,
            high_24h: data.market_data.high_24h.usd, 
            low_24h: data.market_data.low_24h.usd
        }
    }

    private async coinHistory(symbol: string, days: number): Promise<number[][]> {
        const histOpts = {
            id: symbol,
            vs_currency: 'usd',
            days,
            interval: 'hourly'
        };

        const histExt = `/coins/${symbol}/market_chart`;

        const data: { [field: string]: number[][] } = await this._getData(histExt, histOpts);

        if (data == null) return [];

        return data.prices;
    }

    private async _byMarketValue(currency: string, size = 100) {
        const extention = '/coins/markets';

        const options = {
            vs_currency: currency,
            order: 'market_cap_desc',
            per_page: size,
            page: 1,
            sparkline: false,
            price_change_percentage: '24h'
        };

        const data = await this._getData(extention, options);

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
            {
                params: options
            }
        );
    }
}

export = CryptoData;
