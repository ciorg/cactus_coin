import mongoose, { Schema } from 'mongoose';

const CactusSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        required: true
    },
    img_date: {
        type: Date
    },
    image: {
        type: Buffer,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    valid: {
        type: Boolean
    },
    checked: {
        type: Boolean,
        required: true
    },
    checked_date: {
        type: Date
    },
    geo_point: {
        type: Array,
        required: true
    },
    truncated_geo: {
        type: Array,
        required: true
    }
});

const CactusModel = mongoose.model('cactus', CactusSchema);

export = CactusModel;
