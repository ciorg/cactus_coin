import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';

import authenticate from './authenticate';
import routes from './routes';

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(express.static(path.join(process.cwd(), 'static')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(authenticate);
app.use('/', routes);
  
app.listen(port, () => console.log(`Example app listening on port:${port}`));
