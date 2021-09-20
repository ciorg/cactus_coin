import { Request } from 'express';
import Actions from '../utils/db_actions';
import CryptoTransactionModel from '../models/crypto_transaction';
import CryptoData from './crypto_data';
import * as useful from '../utils/useful_funcs';

import * as I from '../interfaces';

class CoinPurchase {
    action: Actions;
    cryptoData: CryptoData;

    constructor() {
        this.action = new Actions(CryptoTransactionModel);
        this.cryptoData = new CryptoData();
    }

    async create(req: Request) {
        const { user }: any = req;

        const coinId = await this.cryptoData.getCoinId(req.body.coin);
       
        const coinPurchaseData = {
            date: req.body.date,
            coin_id: coinId.res,
            exchange: req.body.exchange,
            price: req.body.price,
            size: req.body.size,
            fee: req.body.fee,
            user_id: user._id,
            type: req.body.type

        };
    
        return this.action.create(coinPurchaseData);
    }

    async getTransactions(req: Request): Promise<[I.TransactionsWithSummary[], Date]> {
        const { user }: any = req;

        const results = await this.action.search('user_id', user._id);

        const transactionsByCoin = await this.organizeTransactions(results.res);
       
        const [currentPrices, cacheTime] = await this.getCurrentPrice(Object.keys(transactionsByCoin));

        const summary = this.createSummary(transactionsByCoin, currentPrices);

        return [summary, cacheTime];
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

            const currentValue = currentPrice * transactionTally.coins_owned;

            let unrealized = 0;
            let percentGrowth = '0';

            if (currentValue > 0) {
                unrealized = currentValue + transactionTally.profit_loss
                percentGrowth = useful.setDecimals(
                    ((currentPrice - transactionTally.avg_purchase_price) / transactionTally.avg_purchase_price) * 100, 2
                );
            }


            transactionsWithSummary.push({
                summary: {
                    owned: useful.setDecimals(transactionTally.coins_owned),
                    total_spent: useful.toCurrency(transactionTally.total_cost),
                    avg_price: useful.toCurrency(transactionTally.avg_purchase_price),
                    current_price: useful.toCurrency(currentPrice),
                    realized_profit: useful.toCurrency(transactionTally.profit_loss),
                    unrealized_profit: useful.toCurrency(unrealized),
                    current_value: useful.toCurrency(currentValue),
                    percent_growth: percentGrowth,
                    break_even_price: useful.toCurrency(transactionTally.break_even_price),
                    symbol
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

        const currentCoinsHeld = coinsBought - coinsSold;
        const profitLoss =  realizedGain - cost;
        const avgSellPrice = realizedGain > 0 ? NaN : realizedGain / coinsSold;
        const breakEvenPrice = profitLoss < 0 ? NaN : Math.abs(profitLoss / currentCoinsHeld)

        return {
            realized_gain: realizedGain,
            avg_sell_price: avgSellPrice,
            avg_purchase_price: cost / coinsBought,
            total_cost: cost,
            coins_owned: currentCoinsHeld,
            profit_loss: profitLoss,
            break_even_price: breakEvenPrice
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
            ]);
        }

        formatedTransactions.sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

        return formatedTransactions;
    }
}

export = CoinPurchase;
