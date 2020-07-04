import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import bunyan from 'bunyan';
import RateLimiter from './rate_limiter';

const rl = new RateLimiter();

const logger = bunyan.createLogger({
    name: 'login_actions'
});

async function login(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('local',
    async (err, user, info) => {
        const check = await rl.loginCheck(req);
        if (check.blocked) return blockedNotification(res, check.remaining);

        if (err) return handelErrors(next, err);
  
        if (!user) {
            try {
                await rl.failedLogin(req);
                const check = await rl.loginCheck(req);
                if (check.blocked) return blockedNotification(res, check.remaining);
                return res.render('pages/portal', { message: 'Username or Password is incorrect'});
            } catch (e) {
                if (e instanceof Error) return handelErrors(next, e);
                return blockedNotification(res, e.msBeforeNext);
            }
        }

        req.logIn(user, async function(err) {
            if (err) return handelErrors(next, err);
  
            rl.clear(req);

            return res.redirect('/home');
        });
    })(req, res, next);
}

function blockedNotification(res: Response, timeRemaining: number) {
    res.set('Retry-After', String(Math.round(timeRemaining / 1000)))
    res.status(429).send('Too Many Bad requests');
    return res;
}

function handelErrors(next: NextFunction, err: Error) {
    logger.error(err.message);
    return next(err);
}
 
export = login;
