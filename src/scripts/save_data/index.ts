import SaveCoinData from './_lib/save_coins_data';
import SaveCryptoCategories from './_lib/save_categories';

async function loadCryptoCategories() {
    const saveCats = new SaveCryptoCategories();

    await saveCats.saveCategories();
}

async function saveCoinData() {
    const scd = new SaveCoinData('usd', 10);

    const res = await scd.saveCoins();
}

loadCryptoCategories();

