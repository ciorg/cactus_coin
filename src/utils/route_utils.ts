import { Request, Response } from 'express';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
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

    formatDate(dateObj: any) {
        console.log(dateObj);
        console.log(Date.parse(dateObj));
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
