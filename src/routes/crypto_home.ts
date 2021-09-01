import express, { Request, Response } from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import permissions from '../utils/permissions';
import CoinPurchase from '../controllers/coin_purchase';
import CryptoData from '../controllers/crypto_data';


const router = express.Router();
const coinPurchase = new CoinPurchase();
const cryptoData = new CryptoData();

router.post(
    '/add_coin_purchase',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: Response) => {
        const purchase = await coinPurchase.create(req);

        if (purchase.error) {
            return res.redirect('/error');
        }
        
        res.redirect(`/home`);
});

router.post(
    '/add_exchange',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: Response) => {
        const response = await cryptoData.addExchange(req);

        if (response.error) {
            return res.redirect('/error');
        }
        
        res.redirect(`/home`);
});

router.post(
    '/add_coin',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: Response) => {
        const response = await cryptoData.addCoin(req);

        if (response.error) {
            return res.redirect('/error');
        }
        
        res.redirect(`/home`);
});

export = router;
