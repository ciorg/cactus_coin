import { Request, response } from 'express';
import Controller from './controller';
import Ratings from './ratings';
import RbModel from '../models/rb';
import Utils from './utils';
import * as I from '../interface';

class User extends Controller {
    utils: Utils;
    ratings: Ratings;

    constructor() {
        super();
        this.utils = new Utils();
        this.ratings = new Ratings();
    }

    private _addImagePath(req: Request, rbInfo: Partial<I.RootBeer>) {
        if (req.file && req.file.filename) {
            console.log(req.file);
            rbInfo.image = `rb_imgs/${req.file.filename}`;
        }
    }

    private async _modelAction(action: string, params: any): Promise<I.Result> {
        console.log(params);
        const result: I.Result = { res: null };
    
        try {
            const res = await RbModel[action](params);

            this.log.info(res);

            result.res = res;
        } catch(e) {
            this.errorHandler(e);

            result.error = true;
        }

        return result;
    }

    async create(req: Request) {
        const { user }: any = req;

        const rbInfo: I.RootBeer = {
            name: req.body.rb_brand_name,
            created: new Date(),
            user: user._id
        };

        this._addImagePath(req, rbInfo);
    
        return this._modelAction('create', rbInfo);
    }

    async update(req: Request): Promise<I.Result> {
        const updateFields: { name?: string, image?: string } = {};

        this._addImagePath(req, updateFields);

        if(req.body && req.body.rb_brand_name) {
            updateFields.name = req.body.rb_brand_name;
        }

        if (Object.keys(updateFields).length) {
            try {
                await RbModel.updateOne({ _id: req.params.id }, updateFields);
            } catch (e) {
                return { res: null, error: true } 
            }
        }

        return { res: null };
    }

    async search(field: string, search: string | RegExp) {
        return this._modelAction('find', { [field]: search });
    }

    async findById(id: string) {
        return this._modelAction('findById', id);
    }

    async getUsersRb(req: Request) {
        const { user }: any = req;
        // const result = await this.search('user', user._id);
        const result = await this._modelAction('find', { user: user._id });

        if (result.error) return result;

        result.res = await this.utils.format(result.res);

        return result;
    }

    async getEveryRb(req: Request) {
        const result = await this._modelAction('find', {});

        if (result.error) return result;

        result.res = await this.utils.format(result.res);

        return result;

    }

    async webSearch(req: Request, field: string): Promise <I.Result> {
        const searchTerms = this.utils.makeRegex(req.body.rb_search);

        if (searchTerms) {
            // const result = await this.search(field, searchTerms);
            const result = await this._modelAction('find', { [field]: searchTerms })

            if (result.error) return result;

            result.res = await this.utils.format(result.res);

            return result;
        }

        return { res: null };
    }

    async viewRbInfo(req: Request) {
        const rbResult = await this.findById(req.params.id);

        if (rbResult.error) return rbResult;

        const ratingResult = await this.ratings.getRatingsByRbId(req.params.id);

        if (ratingResult.error) return ratingResult;

        await this.utils.prepRatings(ratingResult.res);

        const avg = this.ratings.avgRating(ratingResult.res);

        const res = {
            rb: rbResult.res,
            ratings: ratingResult.res,
            avg
        }

        return { res };
    }
}

export = User;
