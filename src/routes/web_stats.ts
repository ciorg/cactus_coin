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
        const [total, unique] = await stats.getData(90, 'hour');

        const totalOptions = {
            chart: {
              type: 'line'
            },
            series: [{
              name: 'visits',
              data: Object.values(total)
            }],
            xaxis: {
              categories: Object.keys(total)
            }
          }

          const uniqueOptions = {
            chart: {
              type: 'line'
            },
            series: [{
              name: 'visits',
              data: Object.values(unique)
            }],
            xaxis: {
              categories: Object.keys(unique)
            }
          }

        res.render('pages/web_stats', { user: req.user, totalOptions, uniqueOptions });
    }
);

export = router;