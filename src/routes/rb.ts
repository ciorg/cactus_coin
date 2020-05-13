import express, { Request, Response } from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import crypto from 'crypto';
import path from 'path';
import multer from 'multer';


import rbModel from '../models/rb';
import ratingsModel from '../models/rb_ratings';

import RUtils from '../utils/route_utils';
import userModel from '../models/user';

import permissions from '../utils/permissions';

const routeUtils = new RUtils();

const router = express.Router();

router.get('/rootbeer',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: any, next: any) => {
        const { user }: any = req;

        res.render('pages/rb/home', { user });
    }
);

router.post('/rb_search',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: any, res: Response) => {
        const { user }: any = req;

        let search;

        try {
            search = new RegExp(req.body.rb_search, 'i');
        } catch (e) {
            res.send(e);
        }

        const results = await rbModel.find({ name: search });

        for (const r of results) {
            const name = await userModel.findById(r.created_by, 'username');
            r.created_by = name.username;
        }

        res.render('pages/rb/display', { user, results });
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


router.get('/rb/:rb_id', 
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: Response) => {
        const id = req.params.rb_id;
        const rb = await rbModel.find({ _id: id });

        const ratings = await ratingsModel.find({ rb_id: id });

        
        for (const r of ratings) {
            const name = await userModel.findById(r.rated_by, 'username');
            r.rated_by = name.username;
        }

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
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
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
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
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

router.get('/rb_mine',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: any, res: Response) => {
        const { user }: any = req;

        const results = await rbModel.find({ created_by: user._id });

        for (const r of results) {
            const name = await userModel.findById(r.created_by, 'username');
            r.created_by = name.username;
        }

        res.render('pages/rb/display', { user, results });
    }
);

router.get('/rb_every',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: any, res: Response) => {
        const { user }: any = req;

        const results = await rbModel.find();

        for (const r of results) {
            const name = await userModel.findById(r.created_by, 'username');
            r.created_by = name.username;
        }

        res.render('pages/rb/display', { user, results });
    }
);

export = router;
