import mongoose, { Schema } from 'mongoose';

const CoinTransactionSchema = new Schema({
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
        required: true
    },
    exchange: {
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
    },
    type: {
        type: String,
        required: true
    },
    pool_id: {
        type: String,
        required: true
    }
});

const CoinTransactionModel = mongoose.model('crypto_transactions', CoinTransactionSchema);

export = CoinTransactionModel;
