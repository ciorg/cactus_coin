import { Request } from 'express';
import Actions from './lib/actions';
import NotesModel from '../models/notes';
import Utils from './lib/utils';

import * as I from '../interface';

class Notes {
    utils: Utils;
    action: Actions;

    constructor() {
        this.utils = new Utils();
        this.action = new Actions(NotesModel);
    }

    async create(req: Request) {
        const { user }: any = req;
    
        const note: Partial<I.Note> = {
            user_id: user._id,
            created: new Date(),
            content: req.body.content,
            tags: req.body.tags
        };

        return this.action.create(note);
    }


    // add note to db
    // update note in db
    // read note
    // delete note

}

export = Notes;
