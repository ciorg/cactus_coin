import fs from 'fs-extra';
import path from 'path';
import CoinGeckoApi from '../../utils/coingecko_api';
import CoinModel from '../../models/coin';
import DbActions from '../../utils/db_actions';

class SaveCoinData {
    vs: string;
    size: number;
    api: CoinGeckoApi;
    db: DbActions;

    constructor(vs: string, size: number) {
        this.vs = vs;
        this.size = size;
        this.api = new CoinGeckoApi();
        this.db = new DbActions(CoinModel);
    }

    async getTopCoins() {
        const topCoins = await this.api.marketCapList({
            vs: this.vs,
            size: this.size,
            per_page: 100
        });

        console.log(topCoins.length);

        const coinList = topCoins.map((coin) => coin.id);

        const coinCategories: string[] = []

        for (let i = 0; i < coinList.length; i++) {
            const categories = await this._getCoinCategories(coinList[i]);

            if (categories) categories.forEach((cat) => coinCategories.push(cat));
            await this.sleep(1000);
        }

        fs.writeJsonSync(path.join(process.cwd(), 'categories.txt'), coinCategories, { spaces: 4 });
        console.log(coinCategories);
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

