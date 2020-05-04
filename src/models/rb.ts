import DbApi from '../db_api';

const db = new DbApi('mongodb://localhost/MyDatabase');

const rbSchema =  db.schema({
    name: String,
    created: Date,
    created_by: String,
    image: String
});

const rbModel = db.model('rb', rbSchema);

export = rbModel;
