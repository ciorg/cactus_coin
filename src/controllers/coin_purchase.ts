import { Request } from 'express';
import Actions from '../utils/db_actions';
import CoinPurchaseModel from '../models/coin_purchase';
import CryptoData from './crypto_data';
import Utils from './lib/utils';

import * as I from '../interfaces';

class CoinPurchase {
    utils: Utils;
    action: Actions;
    cryptoData: CryptoData;

    constructor() {
        this.utils = new Utils();
        this.action = new Actions(CoinPurchaseModel);
        this.cryptoData = new CryptoData();
    }

    async create(req: Request) {
        const { user }: any = req;

        const coinId = await this.cryptoData.getCoinId(req.body.coin);
        const exchangeId = await this.cryptoData.getExchangeId(req.body.exchange);
       
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

    async getPurchases(req: Request): Promise<[I.PurchasesWithSummary, Date]> {
        const { user }: any = req;

        const results = await this.action.search('user_id', user._id);

        const purchasesByCoin = await this.organizePurchases(results.res);
       
        const [currentPrices, cacheTime] = await this.getCurrentPrice(Object.keys(purchasesByCoin));

        console.log(currentPrices, cacheTime);

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

    createSummary(purchasesByCoin: I.PurchasesByCoin, currentPrices: I.CurrentPrices): I.PurchasesWithSummary {
        const purchasesWithSummary: I.PurchasesWithSummary = {};

        for (const [coin_id, purchases] of Object.entries(purchasesByCoin)) {
            const [totalSpent, totalSize, allPurchases] = this.tallyPurchases(purchases);

            const avgPrice = (totalSpent/totalSize);
            const [currentPrice, symbol] = currentPrices[coin_id];

            purchasesWithSummary[coin_id] = {
                summary: {
                    total_size: totalSize,
                    total_spent: totalSpent,
                    avg_price: avgPrice,
                    current_price: currentPrice,
                    profit: (totalSize * currentPrice) - totalSpent,
                    symbol
                },
                purchases: allPurchases
            }
        }

        return purchasesWithSummary;
    }

    tallyPurchases(purchases: I.Purchase[]): [number, number, any[][]] {
        let totalSpent = 0;
        let totalSize = 0;

        const allPurchases: any[][] = [];

        for (const purchase of purchases) {
            allPurchases.push([
                purchase.date.toISOString(),
                purchase.size,
                purchase.price,
                purchase.fee,
                purchase.exchange
            ]);

            totalSpent+= (purchase.price + purchase.fee);
            totalSize += purchase.size;
        }

        return [totalSpent, totalSize, allPurchases];
    }
}

export = CoinPurchase;
