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
}

export = CoinPurchase;
