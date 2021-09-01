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

export interface PurchasesByCoin {
    [coin_id: string]: Purchase[];
}

export interface Purchase {
    date: Date;
    exchange: string;
    price: number;
    size: number;
    fee: number;
}

export interface PurchasesWithSummary {
    [coin_id: string]: {
        summary: Summary;
        purchases: any[][];
    }
}

export interface Summary {
    total_size: number;
    total_spent: number;
    avg_price: number;
    current_price: number;
    profit: number;
    symbol: string;
}

export interface CurrentPrices {
    [coin_id: string]: [number, string];
}