import { Document } from 'mongoose';
import * as I from '../interfaces';
import Logger from './logger';

class Actions {
    log: Logger;
    model: any;

    constructor(model: any) {
        this.log = new Logger();
        this.model = model;
    }

    protected async _modelAction(action: string, params: any): Promise<I.Result> {
        const result: I.Result = { res: null };
        
        try {
            const res: Document[] = await this.model[action](params);
            
            this.log.debug(`successfully completed ${action} for ${JSON.stringify(params)}`);
            
            result.res = res;
        } catch(e) {
            this.log.error(e.message, { err: e });
            result.error = true;
        }
        
        return result;
    }

    create(params: any) {
        return this._modelAction('create', params);
    };

    async update(id: string, params: any): Promise<I.Result> {
        const result: I.Result = { res: null };

        if (Object.keys(params).length) {
            try {
                result.res = await this.model.updateOne({ _id: id }, params);
                this.log.debug(`updated ${id}, ${params}`)
            } catch (e) {
                this.log.error(e.message, { err: e });
                result.error = true;
            }
        }

        return result;
    }

    async upsert(query: { [params: string]: any }, record: { [params: string]: any }) {
        const result: I.Result = { res: null };

        try {
            result.res = await this.model.findOneAndUpdate(
                query,
                record,
                { 
                    upsert: true,
                    overwrite: true,
                    new: true
                }
            );
        } catch (e) {
            this.log.error(e.message, { err: e });
            result.error = true;
        }

        return result;
    }

    delete(id: string) {
        return this._modelAction('deleteOne', { _id: id });
    }

    search(field: string, value: any) {
        return this._modelAction('find', { [field]: value });
    }

    searchById(id: string) {
        return this._modelAction('findById', id);
    }

    getAll() {
        return this._modelAction('find', {});
    }

    insertMany(data: any[]) {
        return this._modelAction('insertMany', data);
    }
}

export = Actions;
