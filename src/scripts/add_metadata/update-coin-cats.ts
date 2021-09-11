import SaveCoinData from './_lib/save_coins_data';

const scd = new SaveCoinData();

export async function saveCoinData() {
    // pulls from market data and adds coin categories to the list
    // default is top 500 coins set in configs
    await scd.saveCoins();
}

export async function getCoinList() {
    // imports all the coins in coingecko, but with out categories and market cap data
    // just the symbol, name and id
    await scd.coinList();
}
