import DbApi from './lib/db_api';

const db = new DbApi();

const rbSchema =  db.schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        index: true,
        unique: true
    },
    created: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: String,
        required: true,
        index: true
    },
    image: String
});

const rbModel = db.model('rb', rbSchema);

export = rbModel;
