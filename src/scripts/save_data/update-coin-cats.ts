import SaveCoinData from './_lib/save_coins_data';

async function saveCoinData() {
    const scd = new SaveCoinData();

    await scd.saveCoins();
}

saveCoinData();
