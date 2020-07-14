import bunyan from 'bunyan';

class Logger {
    logger: bunyan
    constructor(path: string) {
        this.logger = bunyan.createLogger({
            name: 'rb_lvl',
            streams: [
                {
                    level: 'info',
                    stream: process.stdout
                },
                {
                    level: 'error',
                    path
                }
            ]
        });
    }

    info(msg: string) {
        this.logger.info(msg);
    }

    error(msg: string) {
        this.logger.error(msg);
    }
}

export = Logger;
