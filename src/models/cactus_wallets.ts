import mongoose, { Schema } from 'mongoose';

const CactusWalletSchema = new Schema({
    created: {
        type: Date,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    wallet_id: {
        type: String,
        required: true
    }
});

const CactusWalletModel = mongoose.model('cactus_wallet', CactusWalletSchema);

export = CactusWalletModel;
