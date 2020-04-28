const mongoose = require('mongoose');
import passportLocalMongoose from 'passport-local-mongoose';

class DB {
    connection: any;

    constructor() {
        this.connection = mongoose.connect('mongodb://localhost/MyDatabase',
            { useNewUrlParser: true, useUnifiedTopology: true });
    }

    userDetails() {
        const Schema = mongoose.Schema;

        const userDetail = new Schema({
            username: String,
            password: String
        });

        userDetail.plugin(passportLocalMongoose);
        return mongoose.model('userInfo', userDetail);

         /*
            UserDetails.register({username:'paul', active: false}, 'paul');
            UserDetails.register({username:'jay', active: false}, 'jay');
            UserDetails.register({username:'roy', active: false}, 'roy');
        */
    }
}

export = DB;