import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import RateLimiter from './rate_limiter';
import Logger from './logger';
import Configs from './configs';

const rl = new RateLimiter();
const configs = new Configs();
const { log_path } = configs.getConfigs();
const logger = new Logger(log_path);

async function login(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('local',
    async (err, user) => {
        const check = await rl.loginCheck(req);
    
        if (check.blocked) return rl.blockedResponse(res, check.remaining, 'To Many Bad Requests');

        if (err) return handelErrors(next, err);
  
        if (!user) {
            try {
                await rl.failedLogin(req);
                const check = await rl.loginCheck(req);
                if (check.blocked) return rl.blockedResponse(res, check.remaining, 'To Many Bad Requests');
                return res.render('pages/portal', { message: 'Username or Password is incorrect'});
            } catch (e) {
                if (e instanceof Error) return handelErrors(next, e);
                return rl.blockedResponse(res, e.msBeforeNext, 'To Many Bad Requests');
            }
        }

        req.logIn(user, async function(err) {
            if (err) return handelErrors(next, err);
  
            rl.clear(req);

            return res.redirect('/home');
        });
    })(req, res, next);
}

function handelErrors(next: NextFunction, err: Error) {
    logger.error(err.message);
    return next(err);
}
 
export = login;
