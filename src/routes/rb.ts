import express, { Request, Response } from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import multer from 'multer';
import permissions from '../utils/permissions';

import RUtils from '../utils/route_utils';

const routeUtils = new RUtils();
const router = express.Router();

router.get('/rootbeer',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: any) => {
        res.render('pages/rb/home', { user: routeUtils.getUser(req) });
    }
);

router.post('/rb_search',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: Response) => {
        const search = routeUtils.makeRegex(req.body.rb_search);

        let results = await routeUtils.searchRootbeer('name', search); 
    
        results = await routeUtils.addUserName(results, 'created_by');

        res.render('pages/rb/display', {
            user: routeUtils.getUser(req),
            results
        });
    }
);

router.get('/rb/:id', 
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: Response) => {
        const rbId = routeUtils.getParam(req, 'id');

        const rb = await routeUtils.getRbById(rbId);

        let ratings = await routeUtils.searchRatings('rb_id', rbId);

        ratings = await routeUtils.addUserName(ratings, 'rated_by');

        const avg = routeUtils.avgRating(ratings);

        res.render('pages/rb/view', {
            user: routeUtils.getUser(req),
            rb: rb,
            ratings,
            avg
        });
});

const upload = multer({ storage: routeUtils.imgStorage() });

router.post(
    '/rb_create',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    upload.single('rb_image'),
    async (req: Request, res: Response) => {
        const response = await routeUtils.createRB(req);
        console.log(response);

        res.redirect('/rootbeer');
});

router.post(
    '/rb_update/:id',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    upload.single('rb_image'),
    async (req: Request, res: Response) => {
        const response = await routeUtils.updateRB(req);
        console.log(response);

        res.redirect(`/rb/${req.params.id}`);
});

router.get('/rb_mine',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: Response) => {
        let results = await routeUtils.searchRootbeer(
            'created_by',
            routeUtils.getUserId(req)
        );
    
        results = await routeUtils.addUserName(results, 'created_by');

        res.render('pages/rb/display', {
            user: routeUtils.getUser(req),
            results
        });
    }
);

router.get('/rb_every',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: any, res: Response) => {
        let results = await routeUtils.getEveryRB();
        results = await routeUtils.addUserName(results, 'created_by'); 

        res.render('pages/rb/display', {
            user: routeUtils.getUser(req),
            results
        });
    }
);

export = router;
