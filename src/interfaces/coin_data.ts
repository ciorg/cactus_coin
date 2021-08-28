export interface CGExchangeInfo {
    name: string;
    target: string;
    trust_score: string;
    trade_url: string;
    volume: string;
}

export interface CoinOpts {
    id: string;
    unit: string;
    value: number
}

export interface Exchange {
    name: string;
    _id: string;
    active: boolean;
    date_added: Date;
    website_url: string
}

export interface Coin {
    date: Date;
    coin_id: string;
    symbol: string;
    categories: string[];
}