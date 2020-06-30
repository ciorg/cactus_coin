import DbApi from './lib/db_api';

const db = new DbApi('mongodb://localhost/MyDatabase');

const rbWriteUpSchema =  db.schema({
    rb_id: { type: String, required: true },
    created: { type: Date, default: Date.now },
    user: { type: String, required: true },
    write_up: { type: String, required: true}
});


const rbWriteUpModel = db.model('rb_write_up', rbWriteUpSchema);

export = rbWriteUpModel;
