import mongoose, { Schema } from 'mongoose';

const CoinPurchaseSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    coin_id: {
        type: String,
        required: true,
        unique: true
    },
    exchange_id: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    fee: {
        type: Number,
        required: true
    }
});

const CoinPurchaseModel = mongoose.model('coin_purchases', CoinPurchaseSchema);

export = CoinPurchaseModel;
