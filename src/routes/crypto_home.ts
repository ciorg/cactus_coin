import express, { Request, Response } from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import permissions from '../utils/permissions';
import CryptoTransaction from '../controllers/crypto_transaction';


const router = express.Router();
const cryptoTransaction = new CryptoTransaction();

router.post(
    '/add_crypto_transaction',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: Response) => {
        const transaction = await cryptoTransaction.create(req);

        if (transaction.error) {
            return res.redirect('/error');
        }
        
        res.redirect(`/home`);
});

router.get(
    '/transactions/:id/delete',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: Response) => {
        const transaction = await cryptoTransaction.delete(req);

        if (transaction.error) {
            return res.redirect('/error');
        }
        
        res.redirect(`/home`);
});

export = router;
