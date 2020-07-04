import { RateLimiterMongo, RateLimiterRes } from 'rate-limiter-flexible';
import { Request } from 'express';
const mongoose = require('mongoose');
import bunyan from 'bunyan';


class LimiterWrapper {
    logger: bunyan;
    med: RateLimiterMongo;
    long: RateLimiterMongo;

    constructor() {
        mongoose.connect(
            'mongodb://localhost/MyDatabase',
            {
                useCreateIndex: true,
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );

        this.logger = bunyan.createLogger({
            name: 'rate_limiter_actions'
        });

        this.med = new RateLimiterMongo({
            storeClient: mongoose.connection,
            keyPrefix: 'medium',
            points: 5,
            duration: 300,
            blockDuration: 1800
        });

        this.long = new RateLimiterMongo({
            storeClient: mongoose.connection,
            keyPrefix: 'long',
            points: 100,
            duration: 86400,
            blockDuration: 86400
        });
    }


    async loginCheck(req: Request) {
        const response = {
            blocked: false,
            remaining: 0
        };
    
        const ip = this.getIpAddress(req);
        const user = this.getUsername(req);

        this.logger.info('login_check', user, ip);

        const results: (RateLimiterRes | null)[] = await Promise.all(
            [this.med.get(user), this.long.get(user), this.med.get(ip), this.long.get(ip)]
        );

        this.logger.info('check_results', results);

        const blockedTime = this.blockCheck(results);

        this.logger.info('block_time', blockedTime);

        if (blockedTime) {
            response.blocked = true;
            response.remaining = blockedTime;
        }

        return response;
    }

    clear(req: Request) {
        const ip = this.getIpAddress(req);
        const user = this.getUsername(req);

        Promise.all([
            this.med.delete(ip), this.med.delete(user), this.long.delete(ip), this.long.delete(user)
        ]).catch((e) => this.logger.error(e.message));
    }

    async failedLogin(req: Request) {
        return Promise.all([
            this.logAttempt(this.getUsername(req)),
            this.logAttempt(this.getIpAddress(req))
        ]);      
    }

    async logAttempt(key: string) {
        return Promise.all([this.med.consume(key), this.long.consume(key)]);
    }

    getIpAddress(req: Request) {
        const ip = req.headers['x-forwarded-for'] || 
            req.connection.remoteAddress || req.socket.remoteAddress;

        if (Array.isArray(ip)) return ip[0].trim();

        if (ip == null) return '127.0.0.1';

        if (typeof ip === 'string' && ip.includes(':') && ip.includes('.')) {
            const lastColon = ip.lastIndexOf(':');
            return ip.slice(lastColon + 1,);
        }

        return ip.split(',')[0].trim();
    }

    getUsername(req: Request) {
        return req.body.username;
    }

    blockCheck(results: (RateLimiterRes | null)[]) {
        return results.reduce((maxRemaining, result) => {
            if (result && result.remainingPoints === 0 && result.msBeforeNext > maxRemaining) {
                maxRemaining = result.msBeforeNext;
            }

            return maxRemaining;
        }, 0);
    }
}


export = LimiterWrapper;
