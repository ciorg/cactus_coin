import DbApi from '../utils/db_api';

const db = new DbApi('mongodb://localhost/MyDatabase');

const rbSchema =  db.schema({
    name: String,
    created: Date,
    user: String,
    image: String
});

const rbModel = db.model('rb', rbSchema);

export = rbModel;
