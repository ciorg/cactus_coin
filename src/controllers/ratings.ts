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
        const rating = this.newRating(req);
    
        return this._modelAction('create', rating);
    }

    async update(req: Request) {
       const rating = this.updateRating(req);

        if (Object.keys(rating).length) {
            try {
                await RatingModel.updateOne({ _id: req.params.id }, rating);
            } catch (e) {
                return { error: true, res: null };
            }
        }

        return { res: null };
    }

    getRbRatings(req: Request) {
        return this.getRatingsByRbId(req.params.rb_id);
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

    private newRating(req: Request) {
        const rating: Partial<I.Rating> = this.createNewRatingObject(req);
        rating.total = this.prepRatings(rating);

        console.log('rating', rating);
        
        return rating;
    }

    private updateRating(req: Request): Partial <I.Rating> {
        const rating: Partial<I.Rating> = this.createRatingObjectUpdate(req);
        rating.total = this.prepRatings(rating);
        
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

    private prepRatings(rating: Partial<I.Rating>): number {
        let total = 0;

        for (const [key, value] of Object.entries(rating)) {
            if (this.ratingField(key)) {
                const ratingValue = Number(value);
                total += ratingValue;
                rating[key] = ratingValue.toFixed(1);
            }
        }
    
        return total;
    }

    private ratingField(key: string) {
        return this.rating_fields.includes(key);
    }

}

export = Ratings;