import path from 'path';
import bunyan from 'bunyan';
import * as I from '../interface';

class Logger {
    logger: bunyan
    constructor() {
        this.logger = bunyan.createLogger({
            name: 'rb_site',
            streams: [
                {
                    level: 'debug',
                    stream: process.stdout
                },
                {
                    level: 'info',
                    path: path.join(logPath, 'log.out'),
                    type: 'rotating-file',
                    period: '1d',
                    count: 10
                },
                {
                    level: 'error',
                    path: path.join(logPath, 'error.out'),
                    type: 'rotating-file',
                    period: '1d',
                    count: 10
                }
            ]
        });
    }

    debug(msg: string, logObj: I.LogObject = { res: undefined, req: undefined }) {
        this.logger.debug(msg);
    }

    info(msg: string, logObj: I.LogObject) {
        this.logger.info(msg);
    }

    error(msg: string, errObj: I.ErrorObject) {
        this.logger.error(errObj, msg);
    }
}

export = Logger;
