import express from 'express';
import connectEnsureLogin from 'connect-ensure-login';

import multer from 'multer';
import path from 'path';

import rbModel from '../models/rb';
import rbRatingModel from '../models/rb_ratings';

const router = express.Router()

router.get('/rootbeer',
    connectEnsureLogin.ensureLoggedIn('/'),
    (req: any, res: any, next: any) => {
        const { user }: any = req;

        if (user && (user.role === 'king' || user.role === 'rr')) {
            res.render('pages/rootbeer', { user });
        } else {
            res.redirect('/home');
        }
    }
);

const imgPath = path.join(process.cwd(), 'static', 'rb_imgs');
    
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imgPath);
    },
    filename: (req, file, cb) => {
        // need a uniq name for each file
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

router.post(
    '/rootbeer',
    upload.single('rb_image'),
    async (req: any, res: any, next: any) => {
        console.log(req.user);
        console.log(req.file);

        const newRbInfo = {
            name: req.body.rb_brand_name,
            created: new Date(),
            created_by: req.user._id,
            image: req.file.path
        };

        let newRb;
        
        try {
            newRb = await rbModel.create(newRbInfo);
        } catch (e) {
            return res.send(e);
        }

        let newRating;

        const rbRating = {
            rb_id: newRb._id,
            ratind_date: new Date(),
            rated_by: req.user._id,
            branding: req.body.rb_branding,
            after_taste: req.body.rb_at,
            aroma: req.body.rb_aroma,
            bite: req.body.rb_bite,
            carbonation: req.body.rb_carb,
            flavor: req.body.rb_flavor,
            smoothness: req.body.rb_smooth,
            sweetness: req.body.rb_sweet,
            overall: req.body.rb_overall,
            notes: req.body.rb_notes
        };

        try {
            newRating = await rbRatingModel.create(rbRating);
        } catch (e) {
            return res.send(e);
        }

        const rObj = {
            rating: newRating,
            rb: newRb
        };
    
        return res.send(rObj);
});

export = router;
