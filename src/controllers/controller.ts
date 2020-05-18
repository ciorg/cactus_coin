import bunyan from 'bunyan';
import { Request } from 'express';


class Controller {
    log: bunyan;

    constructor() {
        this.log = bunyan.createLogger({
            name: 'controller'
        });
    }

    create(req: Request) {}

    update(req: Request) {}

    view(req: Request) {}

    delete(req: Request) {}
}

export = Controller;
