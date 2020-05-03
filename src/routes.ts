import express from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import { check } from 'express-validator'; 
import passport from 'passport';
import multer from 'multer';
import path from 'path';

import userModel from './models/user';

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
            res.redirect('/home');
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

    router.get('/rootbeer',
        connectEnsureLogin.ensureLoggedIn('/'),
        (req: any, res: any, next: any) => {
            const { user }: any = req;

            if (user && (user.role === 'king' || user.role === 'rr')) {
                res.render('pages/rootbeer', { user });
            } else {
                res.redirect('/home');
            }
    });

    const imgPath = path.join(process.cwd(), 'static', 'rb_imgs');
    
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, imgPath);
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
      });

      const upload = multer({ storage });

    router.post(
        '/rootbeer',
        upload.single('rb_image'),
        (req: any, res: any, next: any) => {
        return res.send(req.body);
    });

 export = router;
