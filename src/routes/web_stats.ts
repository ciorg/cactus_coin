import express, { Request, Response } from 'express';
import connectEnsureLogin from 'connect-ensure-login';
import permissions from '../utils/permissions';
import WebStats from '../controllers/web_stats';
import * as I from '../interface';

const router = express.Router();
const stats = new WebStats();

router.get('/web_stats',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king']),
    async (req: Request, res: Response) => {
        const sampleData = await stats.getData(90, 'hour');

        const options = {
            chart: {
              type: 'line'
            },
            series: [{
              name: 'visits',
              data: Object.values(sampleData)
            }],
            xaxis: {
              categories: Object.keys(sampleData)
            }
          }

        res.render('pages/web_stats', { user: req.user, options });
    }
);

export = router;