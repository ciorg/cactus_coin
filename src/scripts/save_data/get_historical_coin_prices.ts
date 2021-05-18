import CoinGeckoApi from '../../utils/coingecko_api';
import PriceModel from '../../models/coin_price';
import DbActions from '../../utils/db_actions';
import DB from '../../utils/db';
import Logger from '../../utils/logger';

interface PriceData {
    prices: number[][];
    market_caps: number[][];
    total_volumes: number[][];
}

interface PriceDoc {
    date: number;
    coin_id: string;
    volume: number;
    market_cap: number;
    price: number;
}


class GetHistoricalCoinPriceData {
    api: CoinGeckoApi;
    logger: Logger;
    dbActions: DbActions;

    constructor() {
        this.api = new CoinGeckoApi();
        this.logger = new Logger();
        this.dbActions = new DbActions(PriceModel);
    }

    async main() {
        const db = new DB();
        await db.connect();

        const topCoins = await this.api.marketCapList();
        this.logger.info(`retrieved ${topCoins.length} from coin gecko api`);

        for (const coin of topCoins) {
            await this.saveCoinData(coin.id);
            await this.sleep(2000);
            console.log('saved', coin.id)
        }


        await db.close();
        this.logger.info('closing');
    }

    async saveCoinData(coin_id: string) {
        const historyArgs = {
            id: coin_id,
            vs: 'usd',
            days: '365',
            interval: 'daily'
        };

        const historicalPrices = await this.api.coinMarketHistory(historyArgs);

        if (historicalPrices != null) {
            const prices = this.addToDb(historicalPrices as PriceData, coin_id);

            await this.dbActions.insertMany(prices);
        }
    }


    addToDb(priceData: PriceData, id: string) {
        const { prices } = priceData;
        const marketCaps = priceData.market_caps;
        const volumes = priceData.total_volumes;

        const priceDocsByDate: PriceDoc[] = [];

        for (let i = 0; i < prices.length; i++) {
            priceDocsByDate.push({
                date: prices[i][0],
                price: prices[i][1],
                market_cap: marketCaps[i][1],
                volume: volumes[i][1],
                coin_id: id
            })
        }

        return priceDocsByDate;
    }

    async sleep(interval: number) {
        await new Promise((resolve) => setTimeout(resolve, interval));
    }
} 

const getHistoricalPrices = new GetHistoricalCoinPriceData();

getHistoricalPrices.main();
