import SaveCryptoCategories from './_lib/save_categories';

async function loadCryptoCategories() {
    const saveCats = new SaveCryptoCategories();

    await saveCats.saveCategories();
}

loadCryptoCategories();
