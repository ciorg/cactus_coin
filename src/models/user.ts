import passportLocalMongoose from 'passport-local-mongoose';
import DbApi from './lib/db_api';

const db = new DbApi('mongodb://localhost/MyDatabase');

const userDetail =  db.schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    active: {
        type: Boolean,
        required: true
    }
});

userDetail.plugin(passportLocalMongoose);

const userModel = db.model('userInfo', userDetail);

export = userModel;
