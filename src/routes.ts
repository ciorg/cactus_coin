import express from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import passport from 'passport';

const router = express.Router();

router.post('/login', (req, res, next) => {
    passport.authenticate('local',
    (err, user, info) => {
      if (err) {
        return next(err);
      }
  
      if (!user) {
        return res.redirect('/login?info=' + info);
      }
  
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
  
        return res.redirect('/');
      });
  
    })(req, res, next);
  });
  
  router.get('/login',
    (req, res) => {
      res.render('pages/login');
    });
  
  router.get('/',
    connectEnsureLogin.ensureLoggedIn(),
    (req, res) => {
      res.render('pages/index');
    });
  
  router.get('/private',
    connectEnsureLogin.ensureLoggedIn(),
    (req, res) => {
      res.render('pages/private');
    });
  
  router.get('/user',
    connectEnsureLogin.ensureLoggedIn(),
    (req, res) => res.send({user: req.user})
  );

  router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  router.get('/about', 
    connectEnsureLogin.ensureLoggedIn(),
    (req, res) => {
      res.render('pages/about');
    }
  );

  /*
  UserDetails.register({username:'paul', active: false}, 'paul');
  UserDetails.register({username:'jay', active: false}, 'jay');
  UserDetails.register({username:'roy', active: false}, 'roy');
  */
 export = router;
