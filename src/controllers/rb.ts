import { Request } from 'express';
import Actions from './lib/actions';
import Ratings from './ratings';
import RbModel from '../models/rb';
import Utils from './lib/utils';
import * as I from '../interface';

class Rootbeer {
    utils: Utils;
    ratings: Ratings;
    rb_actions: Actions;

    constructor() {
        this.rb_actions = new Actions(RbModel);
        this.utils = new Utils();
        this.ratings = new Ratings();
    }

    private _addImagePath(req: Request, rbInfo: Partial<I.RootBeer>) {
        if (req.file && req.file.filename) {
            rbInfo.image = `rb_imgs/${req.file.filename}`;
        }
    }

    async create(req: Request) {
        const { user }: any = req;

        const rbInfo: Partial<I.RootBeer> = {
            name: req.body.rb_brand_name,
            created: new Date(),
            user: user._id
        };

        this._addImagePath(req, rbInfo);
    
        return this.rb_actions.create(rbInfo);
    }

    async update(req: Request): Promise<I.Result> {
        const updateFields: { name?: string, image?: string } = {};

        this._addImagePath(req, updateFields);

        if(req.body && req.body.rb_brand_name) {
            updateFields.name = req.body.rb_brand_name;
        }

        return this.rb_actions.update(req.params.id, updateFields);
    }

    async getUsersRb(req: Request) {
        const { user }: any = req;
        const result = await this.rb_actions.search('user', user._id);

        if (result.error) return result;

        result.res = await this.utils.format(result.res);

        return result;
    }

    async getEveryRb() {
        const result = await this.rb_actions.getAll();

        if (result.error) return result;

        result.res = await this.utils.format(result.res);

        return result;

    }

    async webSearch(req: Request, field: string): Promise <I.Result> {
        const searchTerms = this.utils.makeRegex(req.body.rb_search);

        if (searchTerms) {
            const result = await this.rb_actions.search(field, searchTerms)

            if (result.error) return result;

            result.res = await this.utils.format(result.res);

            return result;
        }

        return { res: null };
    }

    async viewRbInfo(req: Request) {
        const rbResult = await this.rb_actions.searchById(req.params.id);

	if (rbResult.error) return rbResult;

        this.utils.formatRb(rbResult.res);

        const ratingResult = await this.utils.getRatingsByRbId(req.params.id);

        if (ratingResult.error) return ratingResult;

        const writeUpResult = await this.utils.getWriteUpByRbId(req.params.id);

        if (writeUpResult.error) return writeUpResult;

        await this.utils.prepData(ratingResult.res);
        await this.utils.prepData(writeUpResult.res);

        const avg = this.utils.avgRating(ratingResult.res);

        const res = {
            rb: rbResult.res,
            ratings: ratingResult.res,
            writeUps: writeUpResult.res,
            avg
        }

        return { res };
    }
}

export = Rootbeer;
