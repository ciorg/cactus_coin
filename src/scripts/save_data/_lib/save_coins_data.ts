import CoinGeckoApi from '../../../utils/coingecko_api';
import CoinModel from '../../../models/coin';
import DB from '../../../utils/db';
import DbActions from '../../../utils/db_actions';
import Logger from '../../../utils/logger';

class SaveCoinData {
    api: CoinGeckoApi;
    dbActions: DbActions;
    logger: Logger;

    constructor() {
        this.api = new CoinGeckoApi();
        this.dbActions = new DbActions(CoinModel);
        this.logger = new Logger();
    }

    async saveCoins() {
        const db = new DB();
        await db.connect();

        const topCoins = await this.api.marketCapList();

        this.logger.info(`retrieved ${topCoins.length} from coin gecko api`);

        for (const coin of topCoins) {
            const categories = await this._getCoinCategories(coin.id);

            if (categories == null) continue;

            const data = {
                date: new Date(),
                coin_id: coin.id,
                symbol: coin.symbol,
                categories
            }

            await this.dbActions.upsert({ coin_id: coin.id }, data);

            this.logger.info(`updated ${coin.id} with ${categories.length} categories`)

            await this.sleep(1000);
        }

        await db.close();
        this.logger.info('closing');
    }

    async _getCoinCategories(coin: string) {
        const data = await this.api.coinData(coin);

        return data?.categories;
    }

    async sleep(interval: number) {
        await new Promise((resolve) => setTimeout(resolve, interval));
    }
}

export = SaveCoinData;

