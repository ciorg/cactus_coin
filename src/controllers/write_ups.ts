import { Request } from 'express';
import Actions from './lib/actions';
import WriteUpModel from '../models/write_up';
import Utils from './lib/utils';

import * as I from '../interface';

class WriteUps {
    utils: Utils;
    action: Actions;

    constructor() {
        this.utils = new Utils();
        this.action = new Actions(WriteUpModel);
    }

    async create(req: Request) {
        const writeUp = this.newWriteUp(req);

        console.log(writeUp);
    
        return this.action.create(writeUp);
    }

    /*
    async update(req: Request) {
       const rating = this.updateRating(req);

       return this.action.update(req.params.id, rating);
    }

    async delete(req: Request) {
        return this.action.delete(req.params.id);
    }

    getRbRatings(req: Request) {
        return this.action.search('rb_id', req.params.rb_id);
    }

    async ratingsByUser(req: Request) {
        const { user }: any = req;

        const ratings = await this.action.search('user', user._id);

        const ratingsDocs = this.utils.getDocs(ratings.res);

        this.utils.formatDate(ratingsDocs);

        await this.utils.addRbName(ratingsDocs, 'rb_id');

        ratings.res = ratingsDocs;

        return ratings;
    }
    */

    private newWriteUp(req: Request) {
        const { user }: any = req;

        return {
            user: user._id,
            created: new Date(),
            rb_id: req.params.id,
            write_up: req.body.write_up
        }
    }

    /*
    private updateRating(req: Request): Partial <I.Rating> {
        const rating: Partial<I.Rating> = this.createRatingObjectUpdate(req);
        rating.total = this.addRatingTotal(rating);
        
        return rating;
    }
    */
}

export = WriteUps;