import express, { Request, Response } from 'express';
import RB from '../controllers/rb';
import * as I from '../interface';

const router = express.Router();

const rb = new RB();

router.get('/public_rbs', async (req: Request, res: Response) => {
    const result: I.Result = await rb.getEveryRb();

    if (result.error) {
        res.render('pages/error');
    }

    res.render('pages/public/rootbeers', { rbs: result.res });
});

export = router;
