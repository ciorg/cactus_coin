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
}
