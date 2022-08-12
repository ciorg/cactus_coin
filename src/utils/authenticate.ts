import express from 'express';
import passport from 'passport';
import session from 'express-session';
import userModel from '../models/user';
import Configs from './configs';
import Logger from './logger';

const MongoDBStore = require('connect-mongodb-session')(session);

const config = new Configs();

const mongoSettings = config.getMongoConfigs();
const { secret } = config.getWebSiteConfigs();

const logger = new Logger();

const router = express.Router();

const store = new MongoDBStore({
        uri: `mongodb://${mongoSettings.url}:27017/${mongoSettings.database}`,
        collection: 'sessions'
    },
    (error: any) => { if (error) mongoError(error) }
);

store.on('error', (error: any) => { if (error) mongoError(error) });

router.use(session({
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: false,
    store
}));

router.use(passport.initialize());
router.use(passport.session());

passport.use(userModel.createStrategy());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

function mongoError(err: Error) {
    logger.fatal('could not connect to db', { err });
}

export = router;
