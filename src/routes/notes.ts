import express, { Request, Response } from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import permissions from '../utils/permissions';
import Notes from '../controllers/notes';

const notes = new Notes();

const router = express.Router();

router.post(
    '/note/:id',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: Response) => {
    }
);

router.post('/note/:id/update',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: Request, res: Response) => {
    }
)

router.get('/notes',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king', 'rr']),
    async (req: any, res: Response) => {
        const result = await notes.getUsersNotes(req);

        if (result.error) {
            return res.redirect('/error');
        }

        return res.render(
            'pages/notes/view',
            { user: req.user, notes: result.res }
        );
        
});

router.get('/note/:id/delete', async (req: Request, res: Response) => {
});

export = router;
