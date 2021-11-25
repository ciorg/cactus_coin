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

        const summary = await this.createSummary(transactionsByCoin, currentPrices);

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

    async createSummary(
        transactionsByCoin: I.TransactionsByCoin,
        currentPrices: I.CurrentPrices
        ): Promise<I.TransactionsWithSummary[]> {
        const transactionsWithSummary: I.TransactionsWithSummary[] = [];

        for (const [coin_id, transactions] of Object.entries(transactionsByCoin)) {
            const transactionTally = await this.tallyTransactions(transactions);

            const [currentPrice, symbol] = currentPrices[coin_id];

            if (currentPrice == null) continue;

            const {
                loan,
                fiat,
                reinvestment,
                cost,
                own,
                sold,
                soldValue
            } = transactionTally;

            const currentValue = (currentPrice * own);

            const avgPurchasePrice = cost > 0 ? cost / own : 0.00;

            const pPriceDiff = cost > 0 ? ((currentPrice - avgPurchasePrice) / avgPurchasePrice) * 100 : 0.00;

            transactionsWithSummary.push({
                summary: {
                    own: useful.setDecimals(own),
                    current_price: useful.toCurrency(currentPrice),
                    avg_price: useful.toCurrency(avgPurchasePrice),
                    price_diff: useful.setDecimals(pPriceDiff, 2),
                    current_value: useful.toCurrency(currentValue),
                    cost: cost > 0 ? useful.toCurrency(cost) : useful.toCurrency(0),
                    loan: useful.toCurrency(loan),
                    fiat: useful.toCurrency(fiat),
                    reinvestment: useful.toCurrency(reinvestment),
                    cost_cv_diff: useful.toCurrency(currentValue - cost),
                    sold: useful.setDecimals(sold),
                    sold_value: useful.toCurrency(soldValue),
                    avg_sell_price: useful.toCurrency(soldValue / sold),
                    symbol,
                    coin_id
                },
                transactions: await this.formatTransactions(transactions)
            });
        }

        transactionsWithSummary.sort((a, b) => useful.currencyToNumber(b.summary.current_value) - useful.currencyToNumber(a.summary.current_value));

        return transactionsWithSummary;
    }

    async tallyTransactions(transactions: I.Transaction[]): Promise<I.TransactionsTally> {
        let loan = 0;
        let fiat = 0;
        let reinvestment = 0;
        let coinsSold = 0;
        let cost = 0;
        let coinsBought = 0;
        let soldValue = 0;

        for (const transaction of transactions) {
            const poolType = await this.pool.getType(transaction.pool_id);

            const tValue = (transaction.price * transaction.size) - transaction.fee;

            if (transaction.type === 'buy') {
                cost += tValue;
                coinsBought += transaction.size;
                if (poolType === 'loan') loan += tValue;
                if (poolType === 'fiat') fiat += tValue;
                if (poolType === 'reinvestment') reinvestment -= tValue;
            }
            
            if (transaction.type === 'sell') {
                coinsSold += transaction.size;
                soldValue += tValue;
                cost -= tValue;
                if (poolType === 'loan') loan -= tValue;
                if (poolType === 'fiat') fiat -= tValue;
                if (poolType === 'reinvestment') reinvestment += tValue;
            }
        }

        return {
            loan,
            fiat,
            reinvestment,
            cost,
            own: coinsBought - coinsSold,
            sold: coinsSold,
            soldValue
        };
    }

    async formatTransactions(transactions: I.Transaction[]) {
        const formatedTransactions: any[][] = [];

        for (const trans of transactions) {
            const poolName = await this.pool.getName(trans.pool_id);

            formatedTransactions.push([
                useful.formatDate(trans.date),
                trans.exchange,
                trans.type,
                poolName,
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
        let portfolioValue = 0;
        let fiat = 0;
        let loan = 0;
        let reinvestment = 0;

        for (const sum of summaries) {
            portfolioValue += useful.currencyToNumber(sum.summary.current_value);
            fiat += useful.currencyToNumber(sum.summary.fiat);
            loan += useful.currencyToNumber(sum.summary.loan);
            reinvestment += useful.currencyToNumber(sum.summary.reinvestment);
        }

        const totalCost = fiat + loan;

        portfolioValue += reinvestment;

        return {
            portfolio_value: useful.toCurrency(portfolioValue),
            total_cost: useful.toCurrency(totalCost),
            current_value: useful.toCurrency(portfolioValue - (fiat + loan)),
            p_gain: useful.setDecimals(((portfolioValue / totalCost) - 1) * 100, 2),
            loan: useful.toCurrency(loan),
            reinvestment: useful.toCurrency(reinvestment)
        };
    }
}

export = CoinPurchase;
