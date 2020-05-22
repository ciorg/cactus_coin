import express, { Request, Response } from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import { check } from 'express-validator';
import permissions from '../utils/permissions';
import User from '../controllers/user';
import * as I from '../interface';

const user = new User();

const router = express.Router()

router.get(
    '/home',
    connectEnsureLogin.ensureLoggedIn('/'),
    (req: Request, res: Response) => {
      res.render('pages/home', { user: req.user });
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
        check('reg_password').trim().escape().stripLow(),
        check('con_password').trim().escape().stripLow()
    ],
    async (req: Request, res: Response) => {
        const result: I.Result = await user.create(req);

        if (result.error) {
            return res.render('pages/error');
        }
    
        return res.render('pages/home', { user: req.user });
    }
);

export = router;
