import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import compression from 'compression';
import Configs from './utils/configs';
import Logger from './utils/logger';

import authenticate from './utils/authenticate';
import routes from './routes/routes';

const configs = new Configs();
const { env, port } = configs.getConfigs();

const logger = new Logger();

process.env.NODE_ENV = env;

const app = express();
app.set('view engine', 'ejs');

app.use(compression());
app.use(helmet());
app.use(express.static('static'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(authenticate);
app.use('/', routes);

app.use(function(req: Request, res: Response) {
    logger.error(`invalid path ${req.path}`, { err: new Error('bad request'), req });
    res.status(404).redirect('/error');
});
  
app.listen(port, () => logger.info(`App listening on port:${port}`, {}));
