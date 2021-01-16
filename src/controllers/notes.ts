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

    async create(req: Request): Promise<I.Result> {
        const { user }: any = req;
    
        const note: Partial<I.Note> = {
            user: user._id,
            created: new Date(),
            title: req.body.title,
            content: req.body.content,
            tags: this._splitTags(req.body.tags)
        };

        return this.action.create(note);
    }

    async getUsersNotes(req: Request): Promise<I.Result> {
        const { user }: any = req;

        const notes = await this.action.search('user', user._id);

        if (notes.error) return notes;

        const notesDocs = this.utils.getDocs(notes.res);

        this.utils.formatDate(notesDocs);

        return {
            res: notesDocs
        };
    }

    async view(req: Request): Promise<I.Result> {
        return this.action.searchById(req.params.id);
    }


    async update(req: Request): Promise<I.Result> {
        const { user }: any = req;
    
        const note: Partial<I.Note> = {
            user: user._id,
            created: new Date(),
            title: req.body.title,
            content: req.body.content,
            tags: this._splitTags(req.body.tags)
        };

        return this.action.update(req.params.id, note);
    }

    async delete(req: Request): Promise<I.Result> {
        return this.action.delete(req.params.id);
    }

    private _splitTags(tags: string): string[] {
        return tags.split(' ').filter((tag) => tag.trim().length > 0);
    }


    // add note to db
    // update note in db
    // read note
    // delete note

}

export = Notes;
