import express, { Request, Response } from 'express';
import connectEnsureLogin from 'connect-ensure-login';

import multer from 'multer';
import path from 'path';

import permissions from '../permissions';
import rbModel from '../models/rb';

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
    const rbData = await rbModel.find({ _id: id });
    res.send(rbData);
});

const imgPath = path.join(process.cwd(), 'static', 'rb_imgs');
    
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imgPath);
    },
    filename: (req, file, cb) => {
        // need a uniq name for each file
        // epochtime, random int, filename
        cb(null, file.originalname);
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

router.get('/rb_update/:rb_id',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: any, res: any) => {
        const id = req.params.rb_id;
        const rb = await rbModel.find({ _id: id });

        const { user }: any = req;

        res.render('pages/rb/update', { user, rb: rb[0] });
    }
);

router.post(
    '/rb_update',
    upload.single('rb_image'),
    async (req: any, res: any) => {

        /*
        const newRbInfo = {
            name: req.body.rb_brand_name,
            created: new Date(),
            created_by: req.user._id,
            image: req.file.path
        };
        
        try {
            await rbModel.create(newRbInfo);
        } catch (e) {
            return res.send(e);
        }
        */
        
        res.redirect('/rootbeer');
});

export = router;
