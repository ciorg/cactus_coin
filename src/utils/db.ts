import mongoose from 'mongoose';

import Configs from './configs';
import Logger from './logger';

const configs = new Configs();
const logger = new Logger();

const { mongo_settings } = configs.getConfigs();

async function connect() {
    const url = `mongodb://${mongo_settings.url}/${mongo_settings.database}`;

    const db = await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    });

    db.connection.on('error', (error: Error) => {
        logger.fatal('could not connect to db', { err: error });
    });

    db.connection.once('open', () => {
        logger.debug(`connected to ${mongo_settings.url}/${mongo_settings.database}`);
    });
}

export = {
    connect
}