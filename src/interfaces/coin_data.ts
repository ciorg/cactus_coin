export interface ExchangeInfo {
    ex_name: string;
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