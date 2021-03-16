import CoinGeckoApi from '../../utils/coingecko_api';
import CoinGeckApi from '../../utils/coingecko_api';


class SaveCoinData {
    vs: string;
    size: number;
    api: CoinGeckoApi;

    constructor(vs: string, size: number) {
        this.vs = vs;
        this.size = size;
        this.api = new CoinGeckoApi();
    }

    async getTopCoins() {
        const topCoins = await this.api.marketCapList({
            vs: this.vs,
            size: this.size,
            per_page: 10
        });

        const coinList = topCoins.map((coin) => coin.id);

        const coinCategories = {}

        for (const coin of coinList) {
            const categories = await this._getCoinCategories(coin);

            coinCategories[coin] = categories;
            await this.sleep(1000);
        }

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

