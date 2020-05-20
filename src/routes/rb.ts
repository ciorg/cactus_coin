import express, { Request, Response } from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import multer from 'multer';
import permissions from '../utils/permissions';

import RB from '../controllers/rb';
import RUtils from '../utils/route_utils';
import CUtils from '../controllers/utils';

const routeUtils = new RUtils();
const cUtils = new CUtils();
const rb = new RB();
const router = express.Router();

router.get('/rootbeer',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: Response) => {
        res.render('pages/rb/home', { user: req.user });
    }
);

const upload = multer({ storage: routeUtils.imgStorage() });

router.post(
    '/rb_create',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    upload.single('rb_image'),
    async (req: Request, res: Response) => {
        const create = await rb.create(req);

        if (create.error) {
            return res.render('pages/error');
        }

        res.redirect('/rootbeer');
});

router.post(
    '/rb_update/:id',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    upload.single('rb_image'),
    async (req: Request, res: Response) => {
        const update = await rb.update(req);

        if (update.error) {
            return res.render('pages/error');
        }

        res.redirect(`/rb/${req.params.id}`);
});

router.post('/rb_search',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: Response) => {
        const search = await rb.webSearch(req, 'name');

        if (search.error) {
            return res.render('pages/error');
        }
    
        res.render('pages/rb/display', {
            user: req.user,
            results: search.res
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
