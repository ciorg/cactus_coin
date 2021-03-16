import mongoose, { Schema } from 'mongoose';

const CoinSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    id: {
        type: String,
        required: true,
        unique: true
    },
    symbol: {
        type: String,
        required: true,
        unique: true
    },
    categories: {
        type: String,
        required: true,
        unique: false
    }
});

const MarketCapModel = mongoose.model('marketCapRankings', CoinSchema);

export = MarketCapModel;
