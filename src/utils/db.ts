import mongoose from 'mongoose';

import Configs from './configs';
import Logger from './logger';
import * as I from '../interfaces';


class DB {
    logger: Logger;
    configs: I.Mongo;
    db: any;

    constructor() {
        this.logger = new Logger();
        this.configs = new Configs().getMongoConfigs();
        this.db;
    }

    async connect() {
        const url = `mongodb://${this.configs.url}:${this.configs.port}/${this.configs.database}`;

        try {
            this.db = await mongoose.createConnection(url);
        } catch(e: unknown) {
            this.logger.fatal('could not connect to db', { err: e });
        }
    }

    async close() {
        await mongoose.disconnect();
    }
}

export = DB;
