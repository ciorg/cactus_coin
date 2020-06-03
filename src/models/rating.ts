import DbApi from './lib/db_api';

const db = new DbApi('mongodb://localhost/MyDatabase');

const rbRatingSchema =  db.schema({
    rb_id: { type: String, required: true },
    created: { type: Date, default: Date.now },
    user: { type: String, required: true },
    branding: Number,
    after_taste: Number,
    aroma: Number,
    bite: Number,
    carbonation: Number,
    flavor: Number,
    smoothness: Number,
    sweetness: Number,
    total: Number,
    write_up: String
});


const rbRatingModel = db.model('rb_rating', rbRatingSchema);

export = rbRatingModel;
