import { Request } from 'express';
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
            'total'
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

    async create(req: Request) {
        const rating = this.getNewRating(req);
    
        return this._modelAction('create', rating);
    }

    async update(req: Request) {
       const rating = this.getRatingUpdate(req);

        if (Object.keys(rating).length) {
            try {
                await RatingModel.updateOne({ _id: req.params.id }, rating);
            } catch (e) {
                return { error: true, res: null };
            }
        }

        return { res: null };
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

    private getNewRating(req: Request) {
        const rating: Partial<I.Rating> = this.createNewRatingObject(req);
        this.formatRatings(rating);
        rating.total = this.getTotal(rating);
        
        return rating;
    }

    private getRatingUpdate(req: Request): Partial <I.Rating> {
        const rating: Partial<I.Rating> = this.createRatingObjectUpdate(req);
        this.formatRatings(rating);
        rating.total = this.getTotal(rating);
        
        return rating;
    }

    private createRatingObjectUpdate(req: Request) {
        const rating: Partial<I.Rating> = {
            branding: req.body.branding,
            after_taste: req.body.at,
            aroma: req.body.aroma,
            bite: req.body.bite,
            carbonation: req.body.carb,
            flavor: req.body.flavor,
            smoothness: req.body.smooth,
            sweetness: req.body.sweet
        };

        return rating;
    }

    private createNewRatingObject(req: Request) {
        const { user }: any = req;
    
        const rating: Partial<I.Rating> = {
            rb_id: req.params.id,
            created: new Date(),
            user: user._id,
            branding: req.body.branding,
            after_taste: req.body.at,
            aroma: req.body.aroma,
            bite: req.body.bite,
            carbonation: req.body.carb,
            flavor: req.body.flavor,
            smoothness: req.body.smooth,
            sweetness: req.body.sweet
        };

        return rating;
    }

    private formatRatings(rating: Partial<I.Rating>) {
        for (const key of Object.keys(rating)) {
            const value = rating[key];

            if (typeof value === 'number') {
                rating[key] = value.toFixed(1);
            }
        }
    }

    private getTotal(rating: Partial<I.Rating>): number {
        let total = 0;

        for (const value of Object.values(rating)) {
            if (typeof value === 'number') {
                total += value;
            }
        }
    
        return total;
    }

}

export = Ratings;