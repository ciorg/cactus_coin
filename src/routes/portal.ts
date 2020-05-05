import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/',
    (req, res, next) => {
        res.render('pages/portal');
});

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
  
router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

export = router;
