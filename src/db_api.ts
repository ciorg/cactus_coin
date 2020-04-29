const mongoose = require('mongoose');
import passportLocalMongoose from 'passport-local-mongoose';

mongoose.connect('mongodb://localhost/MyDatabase',
{ useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;

// roles are king, rr, user

const userDetail = new Schema({
    username: String,
    password: String,
    role: String,
    registered: Date,
    active: Boolean
});

userDetail.plugin(passportLocalMongoose);

const userModel = mongoose.model('userInfo', userDetail);

export = userModel;
