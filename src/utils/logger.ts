import path from 'path';
import bunyan from 'bunyan';
import Configs from './configs';
import * as I from '../interface';

class Logger {
    logger: bunyan
    configs: Configs;

    constructor() {
        this.configs = new Configs();

        const { log_path, log_level } = this.configs.getConfigs();

        this.logger = bunyan.createLogger({
            name: 'rb_site',
            streams: [
                {
                    level: log_level,
                    path: path.join(log_path, 'info'),
                    type: 'rotating-file',
                    period: '1m',
                    count: 12
                },
                {
                    level: 'error',
                    path: path.join(log_path, 'error'),
                    type: 'rotating-file',
                    period: '1m',
                    count: 12
                },
                {
                    level: 'fatal',
                    path: path.join(log_path, 'fatal'),
                    type: 'rotating-file',
                    period: '1m',
                    count: 12
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

    fatal(msg:string, fatalObj: I.ErrorObject) {
        this.logger.fatal(fatalObj, msg);
        process.exit(1);
    }
}

export = Logger;
