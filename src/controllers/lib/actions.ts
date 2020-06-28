import * as I from '../../interface';
import bunyan from 'bunyan';

class Actions {
    log: bunyan;
    model: any;

    constructor(model: any) {
        this.log = bunyan.createLogger({
            name: 'actions'
        });

        this.model = model;
    }

    protected async _modelAction(action: string, params: any): Promise<I.Result> {
        const result: I.Result = { res: null };
        
        try {
            const res = await this.model[action](params);
            
            this.log.info(`successfully completed ${action} for ${JSON.stringify(params)}`);
            
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
        const result: I.Result = { res: null };

        if (Object.keys(params).length) {
            try {
                result.res = await this.model.updateOne({ _id: id }, params);
            } catch (e) {
                this.log.error(e.message);
                result.error = true;
            }
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
}

export = Actions;
