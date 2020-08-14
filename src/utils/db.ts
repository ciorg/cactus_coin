import mongoose from 'mongoose';

import Configs from './configs';
import Logger from './logger';


class DB {
    logger: Logger;
    configs: Configs;
    db: any;

    constructor() {
        this.logger = new Logger();
        this.configs = new Configs();
        this.db;
    }

    async connect() {
        const { mongo_settings } = this.configs.getConfigs();

        const url = `mongodb://${mongo_settings.url}/${mongo_settings.database}`;

        try {
            this.db = await mongoose.connect(url, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true
            });
        } catch(e) {
            this.logger.fatal('could not connect to db', { err: e });
        }
    }

    async close() {
        await mongoose.disconnect();
    }
}

export = DB;
