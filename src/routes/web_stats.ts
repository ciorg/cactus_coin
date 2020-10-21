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
        const data: I.StatsData = await stats.getData(30, 'days');
          
        res.render('pages/web_stats', {
            user: req.user,
            options: makeOptions(data),
            countByPage: data.tallyByPage,
            countByVisitor: data.tallyByVisitor
        });
    }
);

router.post('/web_stats',
    connectEnsureLogin.ensureLoggedIn('/'),
    permissions(['king']),
    async (req: Request, res: Response) => {
        if (!req.body && !req.body.period && !req.body.unit) {
            res.redirect('/error');
        }

        const data: I.StatsData = await stats.getData(Number(req.body.period), req.body.unit);

        res.render('pages/web_stats', {
            user: req.user,
            options: makeOptions(data),
            countByPage: data.tallyByPage,
            countByVisitor: data.tallyByVisitor
        });
    }
)

export = router;

function makeOptions(data: I.StatsData) {
    return {
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
            type: 'category',
            categories: Object.keys(data.totalVisits),
            labels: {
                show: true,
                rotateAlways: true,
                rotate: -45
            }
        },
        yaxis: {
            show: true
        }
      }
}