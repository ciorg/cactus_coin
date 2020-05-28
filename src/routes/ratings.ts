import express, { Request, Response } from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import permissions from '../utils/permissions';
import Rating from '../controllers/ratings';


const router = express.Router();
const rating = new Rating();

router.post(
    '/rate/:id',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: Response) => {
    
        const newRating = await rating.create(req);

        if (newRating.error) {
            return res.render('pages/error');
        }

        return res.redirect(`/rb/${req.params.id}`);
    }
);

router.post('/ratings/:id/update',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: any, res: Response) => {
        // need to return to rootbeer page
        // get rootbeer id from incoming params

        const update = await rating.update(req);

        if (update.error) {
            return res.render('pages/error');
        }

        return res.redirect('pages/ratings');
    }
)

router.get('/rate/:rb_id',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: Response) => {
        const ratings = await rating.getRatingsByRbId(req.params._id);
        
        if (ratings.error) {
            return res.render('pages/error');
        }

        return res.render(
            'pages/rating/create',
            { user: req.user, rb: req.params.rb_id}
        );
    }
);


/*
router.get('/ratings',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: any, res: Response) => {
        const { user }: any = req;

        const usersRatings = await ratingsModel.find({ rated_by: req.user._id});

        return res.render('pages/rating/view', { user, usersRatings });
});

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
*/

export = router;
