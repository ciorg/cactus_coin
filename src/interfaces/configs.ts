export interface ConfigSettings {
    mongo: Mongo;
    logger: Logger;
    website: WebSite;
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
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | number;
    path: string;
}

export interface CoinGecko {
    base_url: string;
}
