import express, { Request, Response } from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import permissions from '../utils/permissions';
import WriteUp from '../controllers/write_ups';


const router = express.Router();
const writeUp = new WriteUp();

router.post(
    '/rb_write_up/:id',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: Response) => {
        const newWriteUp = await writeUp.create(req);

        if (newWriteUp.error) {
            return res.render('pages/error');
        }

        return res.redirect(`/rb/${req.params.id}`);
    }
);

/*
router.post('/ratings/:id/update',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: any, res: Response) => {
        const update = await rating.update(req);

        if (update.error) {
            return res.render('pages/error');
        }

        return res.redirect('/ratings');
    }
)

router.get('/ratings',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: any, res: Response) => {
        const ratings = await rating.ratingsByUser(req);

        if (ratings.error) {
            return res.render('pages/error');
        }

        return res.render(
            'pages/rating/view',
            { user: req.user, ratings: ratings.res }
        );
});

router.get('/ratings/:id/delete', async (req: Request, res: Response) => {
    const deleteRating = await rating.delete(req);

    if (deleteRating.error) {
        return res.render('pages/error');
    }

    return res.redirect('/ratings');
});
*/

export = router;
