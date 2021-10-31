import express, { Request, Response } from 'express';
import multer from 'multer';
import connectEnsureLogin from 'connect-ensure-login';
import permissions from '../utils/permissions';
import Cactus from '../controllers/cactus_img';

const cactus = new Cactus();

const router = express.Router()

const upload = multer({ storage: multer.memoryStorage() });


router.get(
    '/mine_cc',
    connectEnsureLogin.ensureLoggedIn('/'),
    async(req: Request, res: Response) => {
        const result = await cactus.getCacti(req);

        if (result.error) return res.redirect('/error');

        const allGeoPoints = result.res.map((c: any) => c.truncated_geo);

        return res.render('pages/mine_cc', {
            user: req.user,
            cacti: result.res,
            allCoords: allGeoPoints.join('__')
        })
    }
)

router.get(
    '/verify_cc',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king']),
    async(req: Request, res: Response) => {
        const result = await cactus.forVerifcation(req);

        if (result.error) return res.redirect('/error');

        return res.render('pages/verify_cc', {
            user: req.user,
            cacti: result.res,
        })
    }
)

router.get(
    '/approve_reject/:id/:pass',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king']),
    async(req: Request, res: Response) => {
        const approvalResult = await cactus.approveReject(req);

        if (approvalResult.error) return res.redirect('/error');

        const result = await cactus.forVerifcation(req);

        if (result.error) return res.redirect('/error');

        return res.render('pages/verify_cc', {
            user: req.user,
            cacti: result.res,
        })
    }
)

router.post(
    '/submit_cactus',
    connectEnsureLogin.ensureLoggedIn('/'),
    upload.single('cactus_img'),
    async(req: Request, res: Response) => {
        const result = await cactus.create(req);

        if (result.error) return res.redirect('/error');

        const cactiResult = await cactus.getCacti(req);

        if (cactiResult.error) return res.redirect('/error');

        const allGeoPoints = cactiResult.res.map((c: any) => c.truncated_geo);

        return res.render('pages/mine_cc', {
            user: req.user,
            cacti: cactiResult.res,
            allCoords: allGeoPoints.join('__')
        })
    }
)

export = router;
