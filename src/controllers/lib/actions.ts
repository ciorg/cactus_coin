import * as I from '../../interface';
import bunyan from 'bunyan';

class Actions {
    log: bunyan;
    model: any;

    constructor(model: any) {
        this.log = bunyan.createLogger({
            name: 'rating_actions'
        });

        this.model = model;
    }

    protected async _modelAction(action: string, params: any): Promise<I.Result> {
        const result: I.Result = { res: null };
        
        try {
            const res = await this.model[action](params);
            
            this.log.info(res);
            
            result.res = res;
        } catch(e) {
            this.log.error(e.message);
            result.error = true;
        }
        
        return result;
    }

    create(params: any) {
        return this._modelAction('create', params);
    };

    async update(id: string, params: any): Promise<I.Result> {
        if (Object.keys(params).length) {
            try {
                await this.model.updateOne({ _id: id }, params);
            } catch (e) {
                this.log.error(e.message);
                return { error: true, res: null };
            }
        }

        return { res: null };
    }

    delete(id: string) {
        return this._modelAction('deleteOne', { _id: id });
    }

    search(field: string, value: any) {
        return this._modelAction('find', { [field]: value });
    }
}

export = Actions;
