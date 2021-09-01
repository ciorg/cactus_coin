import express, { Request, Response } from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import { check } from 'express-validator';
import permissions from '../utils/permissions';
import User from '../controllers/user';
import CryptoData from '../controllers/crypto_data';
import CryptoPurchase from '../controllers/coin_purchase';

import * as I from '../interfaces';

const user = new User();
const cryptoData = new CryptoData();
const cryptoPurchase = new CryptoPurchase();

const router = express.Router()

router.get(
    '/home',
    connectEnsureLogin.ensureLoggedIn('/'),
    async (req: Request, res: Response) => {
        const exchanges = await cryptoData.getExchangesNames();
        const coins = await cryptoData.getCoinSymbols();
        // TODO- put in error handling on this step
        const [purchases, cacheTime] = await cryptoPurchase.getPurchases(req);

        if (exchanges.error || coins.error) {
            return res.redirect('/error');
        }

        res.render('pages/home', {
            user: req.user,
            exchanges: exchanges.res,
            coins: coins.res,
            purchases,
            cache_time: cacheTime
        });
    }
);

router.get(
    '/register',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king']),
    (req: Request, res: Response) => {
        res.render('pages/register', { user: req.user });
});

router.post(
    '/register',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king']),
    [
        check('username').trim().escape().stripLow(),
        check('password').trim().escape().stripLow(),
        check('confirm_password').trim().escape().stripLow()
    ],
    async (req: Request, res: Response) => {
        const result: I.Result = await user.create(req);

        if (result.error) {
            return res.redirect('/error');
        }
    
        return res.render('pages/home', { user: req.user });
    }
);

router.get(
    '/user_info',
    connectEnsureLogin.ensureLoggedIn('/'),
    async (req: Request, res: Response) => {
        return res.render('pages/user_info', { user: req.user, message: undefined });        
    }
)

router.post(
    '/set_pass',
    connectEnsureLogin.ensureLoggedIn('/'),
    [
        check('new_password').trim().escape().stripLow()
    ],
    async (req: Request, res: Response) => {
        const result: I.Result = await user.resetPassword(req);

        if (result.error) {
            return res.redirect('/error');
        }

        return res.render(
            'pages/user_info',
            {
                user: req.user,
                message: result.res
            }
        );        
    }
)

export = router;
