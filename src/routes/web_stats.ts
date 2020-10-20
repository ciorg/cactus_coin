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
        const data = await stats.getData(30, 'days');

        const options = {
            chart: {
              type: 'line',
              height: '400px'
            },
            series: [
                {
                    name: 'total-visits',
                    data: Object.values(data.totalVisits)
                },
                {
                    name: 'unique-visits',
                    data: Object.values(data.uniqueVisits)
                }
            ],
            xaxis: {
              categories: Object.keys(data.totalVisits),
              labels: {
                rotate: -45
              }
            }
          }

          
        res.render('pages/web_stats', {
            user: req.user,
            options,
            countByPage: data.tallyByPage,
            countByVisitor: data.tallyByVisitor
        });
    }
);

export = router;