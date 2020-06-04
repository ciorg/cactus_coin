import UserModel from '../../models/user';
import RBModel from '../../models/rb';
import RatingModel from '../../models/rating';
import escapeString from 'js-string-escape';
import safe from 'safe-regex';
import * as I from '../../interface';
import Actions from './actions';


class Utils {
    rbActions: Actions;
    ratingActions: Actions;

    constructor() {
        this.rbActions = new Actions(RBModel);
        this.ratingActions = new Actions(RatingModel);
    }

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

    getDocs(docArray: any[]) {
        return docArray.map((i: any) => i._doc);
    }

    async prepRatings(ratings: Partial<I.Rating>[]) {
        const ratingsDocs = this.getDocs(ratings);

        await this.addUserName(ratingsDocs);
        this.formatDate(ratingsDocs);
    }

    async getRatingsByRbId(rbId: string) {
        return await this.ratingActions.search('rb_id', rbId);
    }

    avgRating(ratings: any) {
        const numerator: number = ratings.length;

        const avgObj: { [propname: string]: any } = {};

        const ratingFields = [
            'branding',
            'after_taste',
            'aroma',
            'bite',
            'carbonation',
            'flavor',
            'smoothness',
            'sweetness',
            'total'
        ];


        for (const rating of ratings) {
            for (const field of ratingFields) {
                if(avgObj[field]) {
                    avgObj[field] += rating[field];
                } else {
                    avgObj[field] = rating[field];
                }
            }
        }

        for (const [key, total] of Object.entries(avgObj)) {
            const avg = total / numerator;
            avgObj[key] = avg.toFixed(1);
        }

        return avgObj;
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

    async addRbName(docArray: any[], field: string) {
        for (const i of docArray) {
    
            const result = await this.rbActions.search('_id', i[field]);

            if (result.error) continue;

            i.rb_name = result.res[0].name;
        }
    }

}

export = Utils;