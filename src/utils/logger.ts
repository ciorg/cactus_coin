import path from 'path';
import bunyan from 'bunyan';
import Configs from './configs';
import * as I from '../interface';

class Logger {
    logger: bunyan
    configs: Configs;

    constructor() {
        this.configs = new Configs();

        const { log_path } = this.configs.getConfigs();

        this.logger = bunyan.createLogger({
            name: 'rb_site',
            streams: [
                {
                    level: 'debug',
                    stream: process.stdout
                },
                {
                    level: 'info',
                    path: path.join(log_path, 'log.out'),
                    type: 'rotating-file',
                    period: '1d',
                    count: 10
                },
                {
                    level: 'error',
                    path: path.join(log_path, 'error.out'),
                    type: 'rotating-file',
                    period: '1d',
                    count: 10
                }
            ]
        });
    }

    debug(msg: string, logObj: I.LogObject = { res: undefined, req: undefined }) {
        this.logger.debug(logObj, msg);
    }

    info(msg: string, logObj: I.LogObject = { res: undefined, req: undefined }) {
        this.logger.info(logObj, msg);
    }

    error(msg: string, errObj: I.ErrorObject) {
        this.logger.error(errObj, msg);
    }
}

export = Logger;
