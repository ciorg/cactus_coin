import { ChangeOptions, MarketCapOrderOptions } from './coin_gecko_api';

export interface ConfigSettings {
    mongo: Mongo;
    logger: Logger;
    web_site: WebSite;
    coin_gecko: CoinGecko;

}

export interface WebSite {
    env: string;
    secret: string;
    port: number
}

export interface Mongo {
    url: string;
    database: string;
}

export interface Logger {
    log_level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | number;
    log_path: string;
}

export interface CoinGecko {
    base_url: string;
    market_cap_args: MarketCapArgs;
}

export interface MarketCapArgs {
    default_size: number;
    vs_currency:string;
    per_page: number;
    order: MarketCapOrderOptions;
    price_change_percentage: ChangeOptions;
    sparkline: boolean;
}
