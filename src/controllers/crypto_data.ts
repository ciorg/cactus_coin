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

    async getData(type: string, opts: I.CoinOpts = { id: 'na', value: 0, unit: 'days' }) {
        const result: I.Result = {
            res: undefined
        };

        let data: any;

        if (type === 'market') {
            data = await this._byMarketValue('usd');
        }
        

        if (type === 'coin') {
            const [
                marketData,
                priceHistory
            ] = await Promise.all([
                this._coinMarket(opts.id),
                this._coinHistory(opts)
            ]);

            data = {
                market_data: marketData,
                chart_options: this._makeChartOptions(priceHistory)
            }
        }
       
        if (data) {
            result.res = data;
            return result;
        }

        result.error = true;
        return result;   
    }

    private async _coinMarket(symbol: string): Promise<I.CoinMarketData> {
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
            id: symbol,
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
            low_24h: this._formatNum(data.market_data.low_24h.usd)
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
    

    private async _coinHistory(opts: I.CoinOpts): Promise<number[][]> {
        const histOpts = {
            id: opts.id,
            vs_currency: 'usd',
            days: this._makeDays(opts),
            interval: this._getInterval(opts)
        };

        const histExt = `/coins/${opts.id}/market_chart`;

        const data: { [field: string]: number[][] } = await this._getData(histExt, histOpts);

        if (data == null) return [];

        return data.prices;
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

    private _makeChartOptions(priceHistory: number[][]) {
        return {
            series: [{
                name: 'USD',
                data: priceHistory
            }],
            chart: {
                type: 'area',
                stacked: false,
                height: 500,
                zoom: {
                    type: 'x',
                    enabled: true,
                    autoScaleYaxis: true
                },
                    toolbar: {
                    autoSelected: 'zoom'
                }
            },
            dataLabels: {
                enabled: false
            },
            markers: {
                size: 0,
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    inverseColors: false,
                    opacityFrom: 0.5,
                    opacityTo: 0,
                    stops: [0, 90, 100]
                },
            },
            yaxis: {
                decimalsInFloat: 2,
                labels: {
                    show: true
                },
                title: {
                    text: undefined
                },
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    format: 'MM/dd/yy',
                    rotate: 45,
                    rotateAlways: true,
                    offsetY: 20
                }
            },
            tooltip: {
                shared: false,
                x: {
                    type: 'datetime',
                    format: 'MM/dd/yy HH:mm:ss'
                }  
            }
        };
    }
}

export = CryptoData;
