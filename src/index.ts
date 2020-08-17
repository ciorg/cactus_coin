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
                'script-src-attr': ["'unsafe-inline'"],
                'font-src': ["'self'", 'https: data:'],
                'style-src': ["'self'", 'https:']
            }
        }
    }));
   
    app.use(express.static('static'));
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(favicon(path.join(__dirname, '..', 'static', 'imgs', 'cc_logo.ico')));
    
    app.use(authenticate);
    app.use('/', routes);
    
    app.use(function(req: Request, res: Response) {
        logger.error(`invalid path ${req.path}`, { err: new Error('bad request'), req });
        res.status(404).redirect('/error');
    });
    
    app.listen(port, () => logger.info(`App listening on port:${port}`, {}));
}

main(); 
