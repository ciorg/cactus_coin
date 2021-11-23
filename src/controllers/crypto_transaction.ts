import { Request } from 'express';
import Actions from '../utils/db_actions';
import CryptoTransactionModel from '../models/crypto_transaction';
import CryptoData from './crypto_data';
import Pool from './pool';
import * as useful from '../utils/useful_funcs';

import * as I from '../interfaces';

class CoinPurchase {
    action: Actions;
    cryptoData: CryptoData;
    pool: Pool;

    constructor() {
        this.action = new Actions(CryptoTransactionModel);
        this.cryptoData = new CryptoData();
        this.pool = new Pool();
    }

    async create(req: Request) {
        const { user }: any = req;

        const coinId = await this.cryptoData.getCoinId(req.body.coin);
        const poolId = await this.pool.getId(req.body.pool);
       
        const coinPurchaseData = {
            date: req.body.date,
            coin_id: coinId.res,
            exchange: req.body.exchange,
            price: req.body.price,
            size: req.body.size,
            fee: req.body.fee,
            user_id: user._id,
            type: req.body.type,
            pool_id: poolId.res

        };
    
        return this.action.create(coinPurchaseData);
    }

    async delete(req: Request) {
        return this.action.delete(req.params.id);
    }


    async getTransactions(req: Request): Promise<[I.TransactionsWithSummary[], I.GrandTally, Date]> {
        const { user }: any = req;

        const results = await this.action.search({ user_id: user._id });

        const transactionsByCoin = await this.organizeTransactions(results.res);
       
        const [currentPrices, cacheTime] = await this.getCurrentPrice(Object.keys(transactionsByCoin));

        const summary = this.createSummary(transactionsByCoin, currentPrices);

        const grandTally = this.grandTally(summary);

        return [summary, grandTally, cacheTime];
    }

    async organizeTransactions(transactions: any[]): Promise<I.TransactionsByCoin> {
        const transactionsByCoin: I.TransactionsByCoin = {};

        for (const transaction of transactions) {
            const coinName = await this.cryptoData.getCoinSymbolById(transaction.coin_id);

            if (transactionsByCoin[coinName]) {
                transactionsByCoin[coinName].push(transaction);
                continue;
            }

            transactionsByCoin[coinName] = [transaction]
        }

        return transactionsByCoin;
    }

    async getCurrentPrice(coinIds: string[]): Promise<[I.CurrentPrices, Date]> {
        const { data, cache_time } = await this.cryptoData.cache.getMarketData(coinIds.join());

        const currentPrices = data.reduce((cp: I.CurrentPrices, coinData) => {
            cp[coinData.id] = [coinData.current_price, coinData.symbol];

            return cp;
        }, {});


        return [currentPrices, cache_time];
    }

    createSummary(transactionsByCoin: I.TransactionsByCoin, currentPrices: I.CurrentPrices): I.TransactionsWithSummary[] {
        const transactionsWithSummary: I.TransactionsWithSummary[] = [];

        for (const [coin_id, transactions] of Object.entries(transactionsByCoin)) {
            const transactionTally = this.tallyTransactions(transactions);

            const [currentPrice, symbol] = currentPrices[coin_id];

            if (currentPrice == null) continue;

            const currentValue = (currentPrice * transactionTally.coins_owned);
            const pPriceDiff = ((currentPrice - transactionTally.avg_purchase_price) / transactionTally.avg_purchase_price) * 100;

            transactionsWithSummary.push({
                summary: {
                    owned: useful.setDecimals(transactionTally.coins_owned),
                    current_price: useful.toCurrency(currentPrice),
                    avg_price: useful.toCurrency(transactionTally.avg_purchase_price),
                    price_diff: useful.setDecimals(pPriceDiff, 2),
                    current_value: useful.toCurrency(currentValue),
                    total_spent: useful.toCurrency(transactionTally.total_cost),
                    sold: useful.toCurrency(transactionTally.realized_gain),
                    diff: useful.toCurrency(currentValue - transactionTally.total_cost + transactionTally.realized_gain),
                    symbol,
                    coin_id
                },
                transactions: this.formatTransactions(transactions)
            });
        }

        transactionsWithSummary.sort((a, b) => useful.currencyToNumber(b.summary.current_value) - useful.currencyToNumber(a.summary.current_value));

        return transactionsWithSummary;
    }

    tallyTransactions(transactions: I.Transaction[]): I.TransactionsTally {
        let realizedGain = 0;
        let coinsSold = 0;
        let cost = 0;
        let coinsBought = 0;

        for (const transaction of transactions) {
            const tValue = (transaction.price * transaction.size) - transaction.fee;

            if (transaction.type === 'buy') {
                cost += tValue;
                coinsBought += transaction.size;
            }
            
            if (transaction.type === 'sell') {
                realizedGain += tValue;
                coinsSold += transaction.size;
            }
        }

        return {
            realized_gain: realizedGain,
            avg_purchase_price: cost / coinsBought,
            total_cost: cost,
            coins_owned: coinsBought - coinsSold
        };
    }

    formatTransactions(transactions: I.Transaction[]) {
        const formatedTransactions: any[][] = [];

        for (const trans of transactions) {
            formatedTransactions.push([
                useful.formatDate(trans.date),
                trans.exchange,
                trans.type,
                useful.setDecimals(trans.size, 4),
                useful.toCurrency(trans.price),
                useful.toCurrency(trans.price * trans.size),
                trans._id
            ]);
        }

        formatedTransactions.sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

        return formatedTransactions;
    }

    grandTally(summaries: I.TransactionsWithSummary[]): I.GrandTally {
        let totalValue = 0;
        let invested = 0;
        let totalSold = 0;

        for (const sum of summaries) {
            totalValue += useful.currencyToNumber(sum.summary.current_value);
            invested += useful.currencyToNumber(sum.summary.total_spent);
            totalSold += useful.currencyToNumber(sum.summary.sold);
        }

        const diff = totalValue - invested + totalSold;

        return {
            total_value: useful.toCurrency(totalValue),
            invested: useful.toCurrency(invested),
            total_sold: useful.toCurrency(totalSold),
            diff: useful.toCurrency(diff),
            p_gain: useful.setDecimals((diff / invested) * 100, 2)
        };
    }
}

export = CoinPurchase;
