import { Request, Response } from 'express';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';

class RB {
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
                cb(null, this.uniqFileName(file.originalname));
            }
        });
    }
}

export = RB;
