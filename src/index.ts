import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
const mongoose = require('mongoose');
import passportLocalMongoose from 'passport-local-mongoose';

import login from './login';


const app = express();

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));


const port = process.env.PORT || 3000;

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost/MyDatabase',
  { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;

const UserDetail = new Schema({
  username: String,
  password: String
});

UserDetail.plugin(passportLocalMongoose);
const UserDetails = mongoose.model('userInfo', UserDetail);


passport.use(UserDetails.createStrategy());
passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

app.use('/', login);
  
app.listen(port, () => console.log(`Example app listening on port:${port}`));
