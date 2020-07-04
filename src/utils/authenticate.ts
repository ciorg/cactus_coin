import express from 'express';
import passport from 'passport';
import session from 'express-session';
import MongoDBStore from 'connect-mongodb-session'
import userModel from '../models/user';

const router = express.Router();

const MongoStore = MongoDBStore(session);

const store = new MongoStore({
        uri: 'mongodb://localhost:27017/MyDatabase',
        collection: 'mySessions'
    },
        (error) => {console.log('error1', error) }
    );

store.on('error', (error) => console.log('error2', error));

router.use(session({
    name: 'session',
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store
}));

router.use(passport.initialize());
router.use(passport.session());

passport.use(userModel.createStrategy());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

export = router;
