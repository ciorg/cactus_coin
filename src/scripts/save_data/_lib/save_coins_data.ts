import CoinGeckoApi from '../../../utils/coingecko_api';
import CoinModel from '../../../models/coin';
import DB from '../../../utils/db';
import DbActions from '../../../utils/db_actions';

class SaveCoinData {
    vs: string;
    size: number;
    api: CoinGeckoApi;
    dbActions: DbActions;

    constructor(vs: string, size: number) {
        this.vs = vs;
        this.size = size;
        this.api = new CoinGeckoApi();
        this.dbActions = new DbActions(CoinModel);
    }

    async saveCoins() {
        const db = new DB();
        await db.connect();

        const topCoins = await this.api.marketCapList({
            vs: this.vs,
            size: this.size,
            per_page: 10
        });

        console.log(topCoins.length);

        for (const coin of topCoins) {
            const categories = await this._getCoinCategories(coin.id);

            const data = {
                date: new Date(),
                coin_id: coin.id,
                symbol: coin.symbol,
                categories
            }

            console.log(data);

            this.dbActions.upsert({ coin_id: coin.id }, data);
            await this.sleep(1000);
        }

        await db.close();
        console.log('closing');
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

