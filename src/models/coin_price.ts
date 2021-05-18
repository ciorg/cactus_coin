import mongoose, { Schema } from 'mongoose';

const CoinPrice = new Schema({
    date: {
        type: Date,
        required: true,
        unique: false
    },
    coin_id: {
        type: String,
        required: true,
        unique: false
    },
    price: {
        type: Number,
        required: true,
        unique: false
    },
    market_cap: {
        type: Number,
        required: false,
        unique: false
    },
    volume: {
        type: Number,
        required: false,
        unique: false
    }
});

const CoinPriceModel = mongoose.model('coin_prices', CoinPrice);

export = CoinPriceModel;
