import SaveCryptoCategories from './_lib/save_categories';

async function loadCryptoCategories() {
    const saveCats = new SaveCryptoCategories();

    await saveCats.saveCategories();
}

async function getCategories() {
    const categories = new SaveCryptoCategories();

    categories.pullCategories();
}

// loadCryptoCategories();
getCategories();
