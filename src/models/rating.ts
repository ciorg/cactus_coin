import DbApi from './lib/db_api';

const db = new DbApi();

const rbRatingSchema =  db.schema({
    rb_id: { type: String, required: true },
    created: { type: Date, default: Date.now },
    user: { type: String, required: true },
    branding: Number,
    flavor: Number,
    aroma: Number,
    after_taste: Number,
    bite: Number,
    carbonation: Number,
    sweetness: Number,
    smoothness: Number,
    total: Number
});

const rbRatingModel = db.model('rb_rating', rbRatingSchema);

export = rbRatingModel;
