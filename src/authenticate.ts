import express from 'express';
import passport from 'passport';
import session from 'express-session';
import userModel from './user';


const router = express.Router();

router.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

router.use(passport.initialize());
router.use(passport.session());

passport.use(userModel.createStrategy());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

export = router;
