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

router.get('/write_ups',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: any, res: Response) => {
        const results = await writeUp.writeUpsByUser(req);

        if (results.error) {
            return res.render('pages/error');
        }

        return res.render(
            'pages/write_up/view',
            { user: req.user, write_ups: results.res }
        );
});

router.post('/write_up/:id/update',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: any, res: Response) => {
        const update = await writeUp.update(req);

        if (update.error) {
            return res.render('pages/error');
        }

        return res.redirect('/write_ups');
    }
)


router.get('/write_up/:id/delete', async (req: Request, res: Response) => {
    const deleteWU = await writeUp.delete(req);

    if (deleteWU.error) {
        return res.render('pages/error');
    }

    return res.redirect('/write_ups');
});

export = router;
