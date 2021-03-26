import SaveCoinData from './_lib/save_coins_data';

async function saveCoinData() {
    const scd = new SaveCoinData('usd', 1000);

    await scd.saveCoins();
}

saveCoinData();
