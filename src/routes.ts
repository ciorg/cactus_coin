import express from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import { check } from 'express-validator'; 
import passport from 'passport';

const router = express.Router();

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
    (req, res, next) => {
        res.render('pages/register');
  });

  router.post(
    '/register',
    [
        check('username').trim().escape().stripLow(),
        check('reg_password').trim().escape().stripLow(),
        check('con_password').trim().escape().stripLow()
    ],
    (req: any, res: any, next: any) => {
        const newUser = {
            uname: req.body.username,
            pass: req.body.reg_password,
            cpass: req.body.con_password
        }

        res.send(newUser);
    });

 export = router;
