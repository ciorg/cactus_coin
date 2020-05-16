import { Request, Response } from 'express';
import path from 'path';
import safe from 'safe-regex';
import multer from 'multer';
import crypto from 'crypto';
import escapeString from 'js-string-escape';
import RBModel from '../models/rb';
import UserModel from '../models/user';
import RatingsModel from '../models/rb_ratings';
import * as I from './interface';

class RB {
    rating_fields: string[];

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
            'overall'
        ];
    }
    getUser(req: Request)  {
       return req.user;
    }

    getUserId(req: Request) {
        const { user }: any = req;

        return user._id;
    }

    getParam(req: Request, field: string) {
        return req.params[field];
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

    searchRootbeer(field: string, search: string | RegExp | null) {
        return RBModel.find({ [field]: search });
    }

    getRbById(id: string) {
        return RBModel.findById(id);
    }

    getEveryRB() {
        return RBModel.find({});
    }

    searchRatings(field: string, search: string | number) {
        return RatingsModel.find({ [field]: search });
    }

    avgRating(ratings: any) {
        const numerator: number = ratings.length;

        const avgObj: { [propname: string]: number } = {};

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
            avgObj[key] = total / numerator;
        }

        return avgObj;
    }

    async addUserName(objArray: any[], userIdField: string): Promise<any[]> {
        for (const i of objArray) {
            const user = await UserModel.findById(i[userIdField], 'username');
            i[userIdField] = user.username;
        }

        return objArray;
    }

    rbInfo(user: any, req: Request) {
        const newRb: I.RootBeer = {
            name: req.body.rb_brand_name,
            created: new Date(),
            created_by: user._id
        };

        if (req.file && req.file.filename) {
            newRb.image = `rb_imgs/${req.file.filename}`;
        }

        return newRb;
    }

    createRB(req: Request) {
        const user = this.getUser(req);
        const rbInfo = this.rbInfo(user, req);
        return RBModel.create(rbInfo);
    }

    updateRB(req: Request) {
        const updateFields: { name?: string, image?: string } = {};
        
        if (req.file && req.file.path) {
            updateFields.image = `rb_imgs/${req.file.filename}`;
        }

        if(req.body && req.body.rb_brand_name) {
            updateFields.name = req.body.rb_brand_name;
        }

        if (Object.keys(updateFields).length) {
            return RBModel.updateOne({ _id: req.params.id }, updateFields) 
        }
    }

    uniqFileName(fileName: string): string {
        const shasum = crypto.createHash('md5');

        const hashInput = new Date().getTime() * Math.random();

        shasum.update(`${hashInput}`, 'utf8');
            
        const prefix = shasum.digest('hex');

        return `${prefix}_${fileName}`;
    }

    imgStorage() {
        return multer.diskStorage({
            destination: (req: Request, file, cb) => {
                cb(null, path.join(process.cwd(), 'static', 'rb_imgs'));
            },
            filename: (req: Request, file, cb) => {
                cb(null, this.uniqFileName(file.filename));
            }
        });
    }
}

export = RB;
