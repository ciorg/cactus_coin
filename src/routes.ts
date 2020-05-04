import express from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import { check } from 'express-validator'; 
import passport from 'passport';
import multer from 'multer';
import path from 'path';

import userModel from './models/user';
import rbModel from './models/rb';
import rbRatingModel from './models/rb_ratings';

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
            // need a uniq name for each file
            cb(null, file.originalname);
        }
      });

      const upload = multer({ storage });

    router.post(
        '/rootbeer',
        upload.single('rb_image'),
        async (req: any, res: any, next: any) => {
            console.log(req.user);
            console.log(req.file);

            const newRbInfo = {
                name: req.body.rb_brand_name,
                created: new Date(),
                created_by: req.user._id,
                image: req.file.path
            };

            let newRb;
            
            try {
                newRb = await rbModel.create(newRbInfo);
            } catch (e) {
                return res.send(e);
            }

            let newRating;

            const rbRating = {
                rb_id: newRb._id,
                ratind_date: new Date(),
                rated_by: req.user._id,
                branding: req.body.rb_branding,
                after_taste: req.body.rb_at,
                aroma: req.body.rb_aroma,
                bite: req.body.rb_bite,
                carbonation: req.body.rb_carb,
                flavor: req.body.rb_flavor,
                smoothness: req.body.rb_smooth,
                sweetness: req.body.rb_sweet,
                overall: req.body.rb_overall,
                notes: req.body.rb_notes
            };

            try {
                newRating = await rbRatingModel.create(rbRating);
            } catch (e) {
                return res.send(e);
            }

            const rObj = {
                rating: newRating,
                rb: newRb
            };
        
            return res.send(rObj);
    });

 export = router;
