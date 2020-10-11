import path from 'path';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import favicon from 'serve-favicon';
import helmet from 'helmet';
import compression from 'compression';
import Configs from './utils/configs';
import Logger from './utils/logger';

import authenticate from './utils/authenticate';
import routes from './routes/routes';
import trackVisit from './utils/record_visit';
import DB from './utils/db';

const db = new DB();

const configs = new Configs();
const { env, port } = configs.getConfigs();

const logger = new Logger();

process.env.NODE_ENV = env;

async function main() {
    await db.connect();

    const app = express();
    app.set('view engine', 'ejs');
    
    app.use(compression());
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                'default-src': ["'self'", "'unsafe-inline'"],
                'script-src-elem': ['https:',"'unsafe-inline'", "'self'"],
                'script-src': [
                    'ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js',
                    'cdn.datatables.net/1.10.21/js/jquery.dataTables.js',
                    'cdn.jsdelivr.net/npm/apexcharts',
                    "'unsafe-inline'",
                    "'self'"
                ],
                'script-src-attr': ["'unsafe-inline'", 'https:'],
                'font-src': ["'self'", 'https: data:'],
                'style-src': ["'self'", 'https:', "'unsafe-inline'"]
            }
        }
    }));
   
    app.use(express.static('static'));
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(favicon(path.join(__dirname, '..', 'static', 'imgs', 'cc_logo.ico')));
    
    app.use(authenticate);
    app.use(trackVisit);
    app.use('/', routes);
    
    app.use(function(req: Request, res: Response) {
        logger.error(`invalid path ${req.path}`, { err: new Error('bad request'), req });
        res.status(404).redirect('/error');
    });
    
    app.listen(port, () => logger.info(`App listening on port:${port}`, {}));
}

main(); 
