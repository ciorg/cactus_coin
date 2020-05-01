import express from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import { check } from 'express-validator'; 
import passport from 'passport';
import userModel from './db_api';

const router = express.Router()

router.post('/portal', (req, res, next) => {
    passport.authenticate('local',
    (err, user, info) => {
      if (err) {
        return next(err);
      }
  
      if (!user) {
        return res.redirect('/?info=' + info);
      }
  
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
  
        return res.redirect('/home');
      });
    })(req, res, next);
  });
  
  router.get('/',
    (req, res, next) => {
      res.render('pages/portal');
    });
  
  router.get(
      '/home',
      connectEnsureLogin.ensureLoggedIn('/'),
      (req, res, next) => {
        const user = req.user;
        res.render('pages/home', { user });
      }
  );
  
  router.get('/logout', (req, res, next) => {
      req.logout();
      res.redirect('/');
  });

  router.get(
    '/register',
    connectEnsureLogin.ensureLoggedIn('/'),
    (req, res, next) => {
        const { user }: any = req;

        if (user && user.role === 'king') {
            res.render('pages/register', { user });
        } else {
            res.redirect('/');
        }
  });

  router.post(
    '/register',
    [
        check('username').trim().escape().stripLow(),
        check('reg_password').trim().escape().stripLow(),
        check('con_password').trim().escape().stripLow()
    ],
    async (req: any, res: any, next: any) => {
        const { username, password, role } = req.body;

        let newuser;

        try {
            newuser = await userModel.register({
                username,
                active: true,
                role,
                registered: new Date()
            }, password);
        } catch (e) {
            return res.send(e);
        }
    
        return res.render('pages/home', { user: newuser });
    });

 export = router;
