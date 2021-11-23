import { Request } from 'express';
import Actions from '../utils/db_actions';
import PoolModel from '../models/pool';

import * as I from '../interfaces';

class Pool {
    action: Actions;

    constructor() {
        this.action = new Actions(PoolModel);
    }

    async create(req: Request) {
        const { user }: any = req;
       
        const poolData = {
            created: new Date(),
            name: req.body.pool_name,
            description: req.body.pool_description,
            user_id: user._id
        };
    
        return this.action.create(poolData);
    }

    async delete(req: Request) {
        return this.action.delete(req.params.id);
    }

    async getId(name: string) {
        const result: I.Result = {
            res: undefined
        };
    
        const response = await this.action.search({ name });

        const { res } = response;

        if (res.length === 1) {
            result.res = res[0]._id;

            return result;
        }

        result.error = true;
        return result;
    }


    async getAllNames(req: Request): Promise<string[]> {
        const { user }: any = req;

        const resp = await this.action.search({ user_id: user._id }, { name: 1 });

        if (resp.res) {
            return resp.res.map((r: { name: string }) => r.name);
        }

        throw Error('could not execute search');
    }
}

export = Pool;
