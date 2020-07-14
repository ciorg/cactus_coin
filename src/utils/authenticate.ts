import express from 'express';
import passport from 'passport';
import session from 'express-session';
import MongoDBStore from 'connect-mongodb-session'
import userModel from '../models/user';
import Configs from './configs';
import Logger from './logger';

const config = new Configs();

const { secret, log_path, mongo_settings } = config.getConfigs();

const logger = new Logger(log_path);

const router = express.Router();

const MongoStore = MongoDBStore(session);

const store = new MongoStore({
        uri: `mongodb://${mongo_settings.url}:27017/${mongo_settings.database}`,
        collection: 'sessions'
    },
    (error) => { if (error) mongoError(error) }
);

store.on('error', (error) => { if (error) mongoError(error) });

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
    logger.error(err.message);
    process.exit(1);
}

export = router;
