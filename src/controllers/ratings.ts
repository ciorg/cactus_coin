import { Request } from 'express';
import Actions from './lib/actions';
import RatingModel from '../models/rating';
import Utils from './lib/utils';

import * as I from '../interface';

class Ratings {
    rating_fields: string[];
    utils: Utils;
    action: Actions;

    constructor() {
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

        this.utils = new Utils();
        this.action = new Actions(RatingModel);
    }

    async create(req: Request) {
        const rating = this.newRating(req);
    
        return this.action.create(rating);
    }

    async update(req: Request) {
       const rating = this.updateRating(req);

       return this.action.update(req.params._id, rating);
    }

    async delete(req: Request) {
        return this.action.delete(req.params._id);
    }

    getRbRatings(req: Request) {
        return this.action.search('rb_id', req.params.rb_id);
    }

    async ratingsByUser(req: Request) {
        const { user }: any = req;

        const ratings = await this.action.search('user', user._id);

        const ratingsDocs = this.utils.getDocs(ratings.res);
        this.utils.formatDate(ratingsDocs);
        ratings.res = this.utils.addRbName(ratingsDocs, 'rb_id');

        return ratings;
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
        rating.total = this.addRatingTotal(rating);
        
        return rating;
    }

    private updateRating(req: Request): Partial <I.Rating> {
        const rating: Partial<I.Rating> = this.createRatingObjectUpdate(req);
        rating.total = this.addRatingTotal(rating);
        
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

    private addRatingTotal(rating: Partial<I.Rating>): number {
        let total = 0;

        for (const [key, value] of Object.entries(rating)) {
            if (this.isRatingField(key)) {
                const ratingValue = Number(value);
                total += ratingValue;
                rating[key] = ratingValue.toFixed(1);
            }
        }
    
        return total;
    }

    private isRatingField(key: string) {
        return this.rating_fields.includes(key);
    }

}

export = Ratings;