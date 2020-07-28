import UserModel from '../../models/user';
import RBModel from '../../models/rb';
import RatingModel from '../../models/rating';
import WriteUpModel from '../../models/write_up';
import escapeString from 'js-string-escape';
import safe from 'safe-regex';
import * as I from '../../interface';
import Actions from './actions';


class Utils {
    rbActions: Actions;
    ratingActions: Actions;
    writeUpActions: Actions;

    constructor() {
        this.rbActions = new Actions(RBModel);
        this.ratingActions = new Actions(RatingModel);
        this.writeUpActions = new Actions(WriteUpModel);
    }

    async addUserName(objArray: any[]) {
        for (const i of objArray) {
            const user = await UserModel.findById(i.user);
            i.user = user.username;
        }
    }

    formatMonth(mon: number): string {
        let m = mon + 1;

        if (m < 10) return `0${m}`;

        return String(m);
    }

    formatDate(rbArray: (I.RootBeer | I.Rating | I.WriteUp)[]) {
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
        await this.getTotalAvg(rbDocs);
        this.formatDate(rbDocs);
        this.rank(rbDocs);

        return rbDocs;
    }

    getDocs(docArray: any[]) {
        return docArray.map((i: any) => i._doc);
    }

    async prepData(data: Partial<I.Rating>[] | Partial<I.WriteUp>[]) {
        const docs = this.getDocs(data);

        await this.addUserName(docs);
        this.formatDate(docs);
    }

    getRatingsByRbId(rbId: string) {
        return this.ratingActions.search('rb_id', rbId);
    }

    getWriteUpByRbId(rbId: string) {
        return this.writeUpActions.search('rb_id', rbId);    
    }

    async getTotalAvg(rbDocs: I.RootBeer[]) {
        for (const rb of rbDocs) {
            const results  = await this.getRatingsByRbId(rb._id);
            rb.rating = this.totalAvg(results.res);
            rb.popular = results.res.length;
        }
    }

    totalAvg(ratings: any[]) {
        if (ratings.length) {
            const sum = ratings.reduce((total: number, rating: any) => {
                total += rating.total;

                return total;
            }, 0)

            return Math.round(sum / ratings.length);
        }

        return 5;
    }

    rank(rbDocs: I.RootBeer[]) {
        rbDocs.sort((a, b) => {
            const r1 = a.rating ? a.rating : 0;
            const r2 = b.rating ? b.rating : 0;
            return r2 - r1;
        });

        rbDocs.forEach((doc, i) => {
            doc.rank = i + 1;
        });
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