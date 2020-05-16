import express from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import { check } from 'express-validator';
import userModel from '../models/user';
import permissions from '../utils/permissions';

const router = express.Router()

router.get(
    '/home',
    connectEnsureLogin.ensureLoggedIn('/'),
    (req, res, next) => {
      const user = req.user;
      res.render('pages/home', { user });
    }
);

router.get(
    '/register',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king']),
    (req, res) => {
        const { user }: any = req;

        res.render('pages/register', { user });
});

router.post(
    '/register',
    [
        check('username').trim().escape().stripLow(),
        check('reg_password').trim().escape().stripLow(),
        check('con_password').trim().escape().stripLow()
    ],
    async (req: any, res: any) => {
        const { username, password, role } = req.body;

        let newuser;

        try {
            newuser = await userModel.register({
                username,
                active: true,
                role,
                created: new Date()
            }, password);
        } catch (e) {
            return res.send(e);
        }
    
        return res.render('pages/home', { user: newuser });
    }
);

export = router;
