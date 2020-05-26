import express, { Request, Response } from 'express';

import portal from './portal';
import user from './user';
import rb from './rb';
import rate from './ratings';

const router = express.Router();

router.get('/error', (req: Request, res: Response) => {
    res.render('pages/error');
});

router.use(portal);
router.use(user);
router.use(rb);
router.use(rate);

 export = router;
