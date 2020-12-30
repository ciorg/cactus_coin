import express, { Request, Response } from 'express';
import * as fs from 'fs-extra';
import path from 'path';
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
    
        const data = await cryptoData.coin(id, 30);

        // const tData = fs.readJsonSync(path.join(process.cwd(), 'tests', 'fixtures', 'coin_resp.json'));

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

export = router;
