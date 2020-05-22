import DbApi from '../utils/db_api';

const db = new DbApi('mongodb://localhost/MyDatabase');

const rbRatingSchema =  db.schema({
    rb_id: String,
    created: Date,
    user: String,
    branding: Number,
    after_taste: Number,
    aroma: Number,
    bite: Number,
    carbonation: Number,
    flavor: Number,
    smoothness: Number,
    sweetness: Number,
    overall: Number,
    notes: String
});


const rbRatingModel = db.model('rb_rating', rbRatingSchema);

export = rbRatingModel;
