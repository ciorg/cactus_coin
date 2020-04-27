import express from 'express';
import passport from 'passport';
import session from 'express-session';
import DB from './db_api';


const router = express.Router();

router.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

router.use(passport.initialize());
router.use(passport.session());

const db = new DB();

const userDetails = db.userDetails();

passport.use(userDetails.createStrategy());
passport.serializeUser(userDetails.serializeUser());
passport.deserializeUser(userDetails.deserializeUser());

export = router;
