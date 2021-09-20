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

export interface TransactionsByCoin {
    [coin_id: string]: Transaction[];
}

export interface Transaction {
    date: Date;
    exchange: string;
    price: number;
    size: number;
    fee: number;
    type: 'buy' | 'sell';
}

export interface TransactionsWithSummary {
    summary: Summary;
    transactions: any[][];
}

export interface Summary {
    owned: string;
    total_spent: string;
    avg_price: string;
    current_price: string;
    unrealized_profit: string;
    realized_profit: string;
    current_value: string;
    percent_growth: string;
    break_even_price: string;
    symbol: string;
}

export interface CurrentPrices {
    [coin_id: string]: [number, string];
}

export interface TransactionsTally {
    realized_gain: number;
    avg_sell_price: number;
    avg_purchase_price: number;
    total_cost: number;
    coins_owned: number;
    profit_loss: number;
    break_even_price: number;
}