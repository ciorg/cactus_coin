import DbApi from '../db_api';

const db = new DbApi('mongodb://localhost/MyDatabase');

const rbSchema =  db.schema({
    name: String,
    created: Date,
    uploaded_by: String,
    image_path: String
});


const rbModel = db.model('rbInfo', rbSchema);

export = rbModel;
