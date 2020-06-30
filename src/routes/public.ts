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

router.post('/pub_search',
    async (req: Request, res: Response) => {
        const result = await rb.webSearch(req, 'name');

        if (result.error) {
            return res.render('pages/error');
        }
    
        res.render('pages/public/rootbeers', {
            rbs: result.res
        });
    }
);

router.get('/public_rb/:id', 
    async (req: Request, res: Response) => {
        const view = await rb.viewRbInfo(req);

        if (view.error) {
            res.render('pages/error');
        }

        res.render('pages/public/view_rb', {
            user: req.user,
            rb: view.res.rb,
            ratings: view.res.ratings,
            avg: view.res.avg,
            writeUps: view.res.writeUps
        });
});

export = router;
