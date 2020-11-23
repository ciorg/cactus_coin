import express, { Request, Response } from 'express';
import CryptoData from '../controllers/crypto_data'

const router = express.Router();
const cryptoData = new CryptoData();

router.get('/crypto/markets',
    async (req: Request, res: Response) => {
    const data = await cryptoData.getData('market');

    if (data.error) {
        return res.redirect('/error');
    }

    res.render('pages/public/crypto_data/markets', {
        user: req.user,
        data: data.res
    });
});

export = router;
