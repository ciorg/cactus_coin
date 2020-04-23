import express from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import passport from 'passport';

const router = express.Router();

router.post('/portal', (req, res, next) => {
    passport.authenticate('local',
    (err, user, info) => {
      if (err) {
        return next(err);
      }
  
      if (!user) {
        return res.redirect('/portal?info=' + info);
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
    (req, res) => {
      res.render('pages/portal');
    });
  
  router.get('/home',
    connectEnsureLogin.ensureLoggedIn(),
    (req, res) => {
      const user = req.user;

      res.render('pages/home', {
        user
      });
    });
  
  router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  /*
  UserDetails.register({username:'paul', active: false}, 'paul');
  UserDetails.register({username:'jay', active: false}, 'jay');
  UserDetails.register({username:'roy', active: false}, 'roy');
  */
 export = router;
