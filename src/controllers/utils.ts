import Controller from './controller';
import UserModel from '../models/user';
import escapeString from 'js-string-escape';
import safe from 'safe-regex';
import * as I from '../interface';
import Ratings from './ratings';


class Utils extends Controller {
    async addUserName(objArray: any[]) {
        for (const i of objArray) {
            const user = await UserModel.findById(i.user);
            i.user = user.username;
        }
    }

    formatMonth(mon: number) {
        let m = mon + 1;

        if (m < 10) return `0${m}`;

        return m;
    }

    formatDate(rbArray: any[]) {
        for (const i of rbArray) {
            const timeStamp = new Date(i.created);

            const date = timeStamp.getDate();
            const month = timeStamp.getMonth();
            const year = timeStamp.getFullYear();
            
            i.created = `${this.formatMonth(month)}/${date}/${year}`;
        }
    }

    async format(rbArray: any[]) {
        const rbDocs = rbArray.map((rb) => rb._doc);
    
        await this.addUserName(rbDocs);
        this.formatDate(rbDocs);
        await this.avgRating(rbDocs);

        return rbDocs;
    }

    async prepRatings(ratings: Partial<I.Rating>[]) {
        const ratingsDocs = ratings.map((i: any) => i._doc);

        await this.addUserName(ratingsDocs);
        this.formatDate(ratingsDocs);
    }

    async avgRating(rbArray: any[]) {
        for (const rb of rbArray) {
            // const ratings = await this.ratings.getRatingsByRbId(rb._id);

            
            /*
            if (ratings.error) {
                rb.avg = null;
                this.log.error(`could not get rating for ${rb._id}`);
                continue;
            }

            if (ratings.res.length === 0) {
                rb.avg = 5;
                continue;
            }
            */

            // rb.avg = this.getAvg(ratings.res);
            rb.avg = 5;
        }
    }

    getAvg(rbRatings: any[]): number {
        const count = rbRatings.length;

        const total = rbRatings.reduce((tc: number, rating: any) => {
            tc += rating.overall;
            return tc;
        }, 0);

        return Math.round(count / total);
    }

    sanitizeRegex(search: string) {
        const escaped = escapeString(search); 

        if (safe(escaped)) {
            return escaped;
        }

        return null;
    }

    makeRegex(search: string) {
        const sanitized = this.sanitizeRegex(search);

        if (sanitized) {
            try {
                return new RegExp(sanitized, 'i');
            } catch (e) {
                return null
            }
        }

        return null;
    }

}

export = Utils;