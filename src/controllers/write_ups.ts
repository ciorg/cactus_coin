import { Request } from 'express';
import Actions from './lib/actions';
import WriteUpModel from '../models/write_up';
import Utils from './lib/utils';

class WriteUps {
    utils: Utils;
    action: Actions;

    constructor() {
        this.utils = new Utils();
        this.action = new Actions(WriteUpModel);
    }

    async create(req: Request) {
        const writeUp = this.newWriteUp(req);
    
        return this.action.create(writeUp);
    }

    async writeUpsByUser(req: Request) {
        const { user }: any = req;

        const writeUps = await this.action.search('user', user._id);

        const writeUpDocs = this.utils.getDocs(writeUps.res);

        this.utils.formatDate(writeUpDocs);

        await this.utils.addRbName(writeUpDocs, 'rb_id');

        writeUps.res = writeUpDocs;

        return writeUps;
    }

    async update(req: Request) {
       const update = { write_up: req.body.write_up };

       return this.action.update(req.params.id, update);
    }

    async delete(req: Request) {
        return this.action.delete(req.params.id);
    }

    private newWriteUp(req: Request) {
        const { user }: any = req;

        return {
            user: user._id,
            created: new Date(),
            rb_id: req.params.id,
            write_up: req.body.write_up
        }
    }
}

export = WriteUps;