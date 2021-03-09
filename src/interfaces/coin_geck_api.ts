export interface marketCapListArgs {
    vs: string,
    size: number,
    per_price_change?: changeDuration[];
}

enum changeDuration {
    '1h',
    '24h',
    '7d',
    '14d',
    '30d',
    '200d',
    '1y' 
}