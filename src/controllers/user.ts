import Controller from './controller';
import { Request } from 'express';
import userModel from '../models/user';
import * as I from '../interface';

class User extends Controller {
    async create(req: Request) {
        const {
            username,
            password,
            role
        } = req.body;

        const result: I.Result = {
            msg: null
        };

        try {
            const response = await userModel.register({ 
                username,
                active: true,
                role,
                created: new Date()
            }, password);

            result.msg = `created: ${response.username}, id: ${response._id}`;
        } catch (e) {
            result.error = true;
            this.log.error(e)
        }

        this.log.info(result.msg);
        return result;
    }

}

export = User;
