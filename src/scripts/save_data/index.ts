import SaveCoinData from './coin_categories';

async function go() {
    const scd = new SaveCoinData('usd', 50);

    const res = await scd.getTopCoins();
}

go();
