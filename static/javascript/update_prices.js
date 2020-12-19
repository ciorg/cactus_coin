'use strict';

function updatePrices(data) {
    for (const d of data) {
        const newPrice = d.current_price;

        const priceElement = document.getElementById(`${d.symbol}_price`);

        if (priceElement) {
            const currentPrice = priceElement.innerText.slice(1, 100).split(',').join('');
            
            const priceChange = evalPrice(newPrice, currentPrice);
            
            priceElement.classList.remove('priceHigher', 'priceLower');
            
            if (priceChange === 'higher') {
                priceElement.classList.add('priceHigher');
            }
            
            if (priceChange === 'lower') {
                priceElement.classList.add('priceLower');
            }

            priceElement.innerText = asCurrency(d.current_price);
            
            document.getElementById(`${d.symbol}_dper`).innerText = toFixed(d.price_change_percentage_24h);
        }
    }
}

function getPrices() {        
    const options = {
    responseType: 'json',
    params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 100,
            page: 1,
            sparkline: false,
            price_change_percentage: '24h'
        }
    };

    axios.get('https://api.coingecko.com/api/v3/coins/markets', options)
        .then((res) => {
            if (res.status === 200) {
                updatePrices(res.data);
            }
        })
        .catch((e) => console.log(e.msg));
}

function evalPrice(n1, n2) {
    const num1 = Number.parseFloat(n1, 10);
    const num2 = Number.parseFloat(n2, 10);

    if(num1 > num2) return 'higher';

    if (num1 < num2) return 'lower';

    return 'equal';
}

function asCurrency(value) {
    return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD'});
}

function toFixed(value, num = 4) {
    return Number(value).toFixed(num)
}