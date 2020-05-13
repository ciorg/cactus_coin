import express, { Request, Response } from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import permissions from '../utils/permissions';

import rbModel from '../models/rb';
import ratingsModel from '../models/rb_ratings';

const router = express.Router();

router.get('/rate/:rb_id',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: any, res: any) => {
        const { user }: any = req;

        const rb = await rbModel.find({ _id: req.params.rb_id});

        res.render('pages/rating/create', { user, rb: rb[0]});
    }
);

router.post(
    '/rate/:id',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: any, res: Response) => {
        const rating = {
            rb_id: req.params.id,
            rating_date: new Date(),
            rated_by: req.user._id,
            branding: req.body.branding,
            after_taste: req.body.at,
            aroma: req.body.aroma,
            bite: req.body.bite,
            carbonation: req.body.carb,
            flavor: req.body.flavor,
            smoothness: req.body.smooth,
            sweetness: req.body.sweet,
            overall: req.body.overall,
            notes: req.body.notes
        }

        try {
            await ratingsModel.create(rating);
        } catch (e) {
            return res.send(e);
        }

        return res.redirect(`/rb/${req.params.id}`);
});

router.get('/ratings',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: any, res: Response) => {
        const { user }: any = req;

        const usersRatings = await ratingsModel.find({ rated_by: req.user._id});

        return res.render('pages/rating/view', { user, usersRatings });
});

router.post('/ratings/:id/update',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: any, res: Response) => {
        const updatedRating = {
            rating_date: new Date(),
            rated_by: req.user._id,
            branding: req.body.branding,
            after_taste: req.body.at,
            aroma: req.body.aroma,
            bite: req.body.bite,
            carbonation: req.body.carb,
            flavor: req.body.flavor,
            smoothness: req.body.smooth,
            sweetness: req.body.sweet,
            overall: req.body.overall,
            notes: req.body.notes
        };

        if (Object.keys(updatedRating).length) {
            try {
                const update = await ratingsModel.updateOne({ _id: req.params.id }, updatedRating);
                res.redirect('/ratings');
            } catch (e) {
                res.send(e);
            }
        }
        
    }
)

router.get('/ratings/:id/delete', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const response = await ratingsModel.deleteOne({ _id: id });

        console.log(response);

        res.redirect('/ratings');
    } catch (e) {
        res.send(e);
    }
});

export = router;
