import { Request } from 'express';
import Controller from './controller';
import RbModel from '../models/rb';
import Utils from './utils';
import * as I from '../interface';
import { Result } from 'express-validator';

class User extends Controller {
    utils: Utils;

    constructor() {
        super();
        this.utils = new Utils();
    }

    private _addImagePath(req: Request, rbInfo: Partial<I.RootBeer>) {
        if (req.file && req.file.filename) {
            rbInfo.image = `rb_imgs/${req.file.filename}`;
        }
    }

    private async _modelAction(action: string, ...params: any): Promise<I.Result> {
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
            return this._modelAction('updateOne', { _id: req.params.id }, updateFields);
        }

        return { res: null };
    }

    async search(field: string, search: string | RegExp) {
        return this._modelAction('find', { [field]: search });
    }

    async webSearch(req: Request, field: string): Promise <I.Result> {
        const searchTerms = this.utils.makeRegex(req.body.rb_search);

        if (searchTerms) {
            const result = await this.search(field, searchTerms);

            if (result.error) return result;

            result.res = await this.utils.addUserName(result.res);

            return result;
        }

        return { res: null };
    }
}

export = User;
