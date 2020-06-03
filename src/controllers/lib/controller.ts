import bunyan from 'bunyan';
import { Request } from 'express';


class Controller {
    log: bunyan;

    constructor() {
        this.log = bunyan.createLogger({
            name: 'controller'
        });
    }

    errorHandler(e: Error) {
        this.log.error(e.message);
    }

    create(req: Request) {}

    update(req: Request) {}

    view(req: Request) {}

    delete(req: Request) {}
}

export = Controller;
