import Controller from './controller';
import RatingModel from '../models/rb_ratings';

import * as I from '../interface';

class Ratings extends Controller {
    rating_fields: string[];

    constructor() {
        super();

        this.rating_fields = [
            'branding',
            'after_taste',
            'aroma',
            'bite',
            'carbonation',
            'flavor',
            'smoothness',
            'sweetness',
            'overall'
        ];
    }

    private async _modelAction(action: string, params: any): Promise<I.Result> {
        const result: I.Result = { res: null };
    
        try {
            const res = await RatingModel[action](params);

            this.log.info(res);

            result.res = res;
        } catch(e) {
            this.errorHandler(e);

            result.error = true;
        }

        return result;
    }

    getRatingsByRbId(rbId: String) {
        return this._modelAction('find', { rb_id: rbId });
    }

    avgRating(ratings: any) {
        const numerator: number = ratings.length;

        const avgObj: { [propname: string]: any } = {};

        for (const rating of ratings) {
            for (const field of this.rating_fields) {
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

}

export = Ratings;