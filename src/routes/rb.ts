import express, { Request, Response } from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import crypto from 'crypto';

import multer from 'multer';
import path from 'path';

import permissions from '../permissions';
import rbModel from '../models/rb';
import ratingsModel from '../models/rb_ratings';

const router = express.Router();

router.get('/rootbeer',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: any, res: any, next: any) => {
        const { user }: any = req;

        const rbs = await rbModel.find({});

        res.render('pages/rb/home', { user, rbs });
    }
);

router.get('/rb_create',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    (req: any, res: any) => {
        const { user }: any = req;

        res.render('pages/rb/create', { user });
    }
);

router.get('/rb/:rb_id/delete', async (req: Request, res: Response) => {
    const id = req.params.rb_id;

    try {
        const response = await rbModel.deleteOne({ _id: id });

        console.log(response);

        res.redirect('/rootbeer');

    } catch (e) {
        res.send(e);
    }
});

router.get('/rb/:rb_id', async (req: Request, res: Response) => {
        const id = req.params.rb_id;
        const rb = await rbModel.find({ _id: id });
        const ratings = await ratingsModel.find({ rb_id: id });

        const { user }: any = req;

        res.render('pages/rb/view', { user, rb: rb[0], ratings });
});

const imgPath = path.join(process.cwd(), 'static', 'rb_imgs');
    
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imgPath);
    },
    filename: (req, file, cb) => {
        const shasum = crypto.createHash('md5');

        const hashInput = new Date().getTime() * Math.random();

        shasum.update(`${hashInput}`, 'utf8');
    
        const prefix = shasum.digest('hex');

        cb(null, `${prefix}_${file.originalname}`);
    }
});

const upload = multer({ storage });

router.post(
    '/rb_create',
    upload.single('rb_image'),
    async (req: any, res: any) => {
        const newRbInfo = {
            name: req.body.rb_brand_name,
            created: new Date(),
            created_by: req.user._id,
            image: `rb_imgs/${req.file.filename}`
        };
        
        try {
            await rbModel.create(newRbInfo);
        } catch (e) {
            return res.send(e);
        }
        
        res.redirect('/rootbeer');
});

router.post(
    '/rb_update/:id',
    upload.single('rb_image'),
    async (req: any, res: any) => {
        const updateFields: { name?: string, image?: string } = {};
        
        if (req.file && req.file.path) {
            updateFields.image = `rb_imgs/${req.file.filename}`;
        }

        if(req.body && req.body.rb_brand_name) {
            updateFields.name = req.body.rb_brand_name;
        }

        if (Object.keys(updateFields).length) {
            try {
                const update = await rbModel.updateOne({ _id: req.params.id }, updateFields) 
            } catch (e) {
                res.send(e);
            }
        }
        
        res.redirect(`/rb/${req.params.id}`);
});

export = router;
