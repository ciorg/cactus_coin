import passportLocalMongoose from 'passport-local-mongoose';
import DbApi from '../db_api';

const db = new DbApi('mongodb://localhost/MyDatabase');

const userDetail =  db.schema({
    username: String,
    password: String,
    role: String,
    registered: Date,
    active: Boolean
});

userDetail.plugin(passportLocalMongoose);

const userModel = db.model('userInfo', userDetail);

export = userModel;
