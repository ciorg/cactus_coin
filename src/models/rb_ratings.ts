import DbApi from '../db_api';

const db = new DbApi('mongodb://localhost/MyDatabase');

const rbRatingSchema =  db.schema({
    rb_id: String,
    rating_date: Date,
    rated_by: String,
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
