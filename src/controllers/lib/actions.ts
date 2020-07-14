import * as I from '../../interface';
import Logger from '../../utils/logger';
import Configs from '../../utils/configs';

class Actions {
    log: Logger;
    model: any;

    constructor(model: any) {
        const configs: Configs = new Configs();

        this.log = new Logger(configs.getConfigs().log_path);

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
