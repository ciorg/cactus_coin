import { Request } from 'express';
import Actions from '../utils/db_actions';
import CoinPurchaseModel from '../models/coin_purchase';
import CryptoData from './crypto_data';
import * as useful from '../utils/useful_funcs';

import * as I from '../interfaces';

class CoinPurchase {
    action: Actions;
    cryptoData: CryptoData;

    constructor() {
        this.action = new Actions(CoinPurchaseModel);
        this.cryptoData = new CryptoData();
    }

    async create(req: Request) {
        // all coins will be grabbed by coingecko
        // if not in coin gecko?
        // price will be same as purchased

        const { user }: any = req;

        console.log(req.body.coin);

        const coinId = await this.cryptoData.getCoinId(req.body.coin);
        const exchangeId = await this.cryptoData.getExchangeId(req.body.exchange);

        console.log(coinId);
        console.log(exchangeId);
       
        const coinPurchaseData = {
            date: req.body.date,
            coin_id: coinId.res,
            exchange_id: exchangeId.res,
            price: req.body.price,
            size: req.body.size,
            fee: req.body.fee,
            user_id: user._id

        };
    
        return this.action.create(coinPurchaseData);
    }

    async getPurchases(req: Request): Promise<[I.PurchasesWithSummary[], Date]> {
        const { user }: any = req;

        const results = await this.action.search('user_id', user._id);

        const purchasesByCoin = await this.organizePurchases(results.res);
       
        const [currentPrices, cacheTime] = await this.getCurrentPrice(Object.keys(purchasesByCoin));

        console.log(currentPrices);

        const summary = this.createSummary(purchasesByCoin, currentPrices);

        return [summary, cacheTime];
    }

    async organizePurchases(purchases: any[]): Promise<I.PurchasesByCoin> {
        const purchasesByCoin: I.PurchasesByCoin = {};

        for (const purchase of purchases) {
            const coinName = await this.cryptoData.getCoinSymbolById(purchase.coin_id);
            const exchange = await this.cryptoData.getExchangeNameById(purchase.exchange_id);

            const purchaseData = {
                date: purchase.date,
                exchange,
                price: purchase.price,
                size: purchase.size,
                fee: purchase.fee
            };

            if (purchasesByCoin[coinName]) {
                purchasesByCoin[coinName].push(purchaseData);
                continue;
            }

            purchasesByCoin[coinName] = [purchaseData]
        }

        return purchasesByCoin;
    }

    async getCurrentPrice(coinIds: string[]): Promise<[I.CurrentPrices, Date]> {
        const { data, cache_time } = await this.cryptoData.cache.getMarketData(coinIds.join());

        const currentPrices = data.reduce((cp: I.CurrentPrices, coinData) => {
            cp[coinData.id] = [coinData.current_price, coinData.symbol];

            return cp;
        }, {});


        return [currentPrices, cache_time];
    }

    createSummary(purchasesByCoin: I.PurchasesByCoin, currentPrices: I.CurrentPrices): I.PurchasesWithSummary[] {
        const purchasesWithSummary: I.PurchasesWithSummary[] = [];

        for (const [coin_id, purchases] of Object.entries(purchasesByCoin)) {
            const [totalSpent, totalSize, allPurchases] = this.tallyPurchases(purchases);

            const avgPrice = (totalSpent/totalSize);
            const [currentPrice, symbol] = currentPrices[coin_id];

            if (currentPrice == null) continue;

            const currentValue = currentPrice * totalSize;

            purchasesWithSummary.push({
                summary: {
                    total_size: useful.setDecimals(totalSize),
                    total_spent: useful.toCurrency(totalSpent),
                    avg_price: useful.toCurrency(avgPrice),
                    current_price: useful.toCurrency(currentPrice),
                    profit: useful.toCurrency(currentValue - totalSpent),
                    current_value: useful.toCurrency(currentValue),
                    percent_growth: useful.setDecimals(((currentValue - totalSpent)/totalSpent) * 100, 2),
                    symbol
                },
                purchases: allPurchases
            });
        }

        purchasesWithSummary.sort((a, b) => useful.currencyToNumber(b.summary.profit) - useful.currencyToNumber(a.summary.profit));

        return purchasesWithSummary;
    }

    tallyPurchases(purchases: I.Purchase[]): [number, number, any[][]] {
        let totalSpent = 0;
        let totalSize = 0;

        const allPurchases: any[][] = [];

        for (const purchase of purchases) {
            const total = (purchase.price * purchase.size) + purchase.fee;

            allPurchases.push([
                useful.formatDate(purchase.date),
                useful.setDecimals(purchase.size),
                useful.toCurrency(purchase.price),
                useful.toCurrency(purchase.fee),
                useful.toCurrency(total),
                purchase.exchange
            ]);

            totalSpent+= total;
            totalSize += purchase.size;
        }

        return [totalSpent, totalSize, allPurchases];
    }
}

export = CoinPurchase;
