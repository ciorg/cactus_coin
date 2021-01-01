import express, { Request, Response } from 'express';
import CryptoData from '../controllers/crypto_data'
import * as I from '../interface';

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
    }
);

router.get('/crypto/coin/:id',
    async(req: Request, res: Response) => {
        const id = req.params.id;

        const opts = {
            id,
            unit: 'days',
            value: 30
        }
    
        const data = await cryptoData.getData('coin', opts);

        if (data.error) {
            return res.redirect('/error');
        }

        res.render('pages/public/crypto_data/coin', {
            user: req.user,
            market_data: data.res.market_data,
            chart_options: data.res.chart_options
        });
    }
);

router.post('/crypto/coin/:id',
    async (req: Request, res: Response) => {
        if (!req.body && !req.body.period && !req.body.unit) {
            res.redirect('/error');
        }

        const opts = {
            id: req.params.id,
            unit:req.body.unit,
            value:  Number(req.body.period)
        }

        const data: I.Result = await cryptoData.getData('coin', opts);

        res.render('pages/public/crypto_data/coin', {
            user: req.user,
            market_data: data.res.market_data,
            chart_options: data.res.chart_options
        });
    }
)

export = router;
