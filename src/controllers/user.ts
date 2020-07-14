import { Request } from 'express';
import userModel from '../models/user';
import Logger from '../utils/logger';
import Configs from '../utils/configs';
import * as I from '../interface';

class User {
    log: Logger;

    constructor() {
        const configs = new Configs;
        this.log = new Logger(configs.getConfigs().log_path);
    }

    async create(req: Request) {
        const {
            username,
            password,
            role
        } = req.body;

        const result: I.Result = {
            res: null
        };

        try {
            const response = await userModel.register({ 
                username,
                active: true,
                role,
                created: new Date()
            }, password);

            this.log.info(`created: ${response.username}, id: ${response._id}`);
            result.res = response._id;
        } catch (e) {
            result.error = true;
            this.log.error(e.message)
        }

        return result;
    }

    async resetPassword(req: Request): Promise<I.Result> {
        const result: I.Result = {
            res: null
        };
    
        const {
            current_password,
            new_password
        } = req.body;

        const { user }: any = req;

        try {
            const userM = await userModel.findByUsername(user.username);
    
            await userM.changePassword(current_password, new_password)

            await userM.save();

            result.res = 'password reset successfully';
        } catch(e) {
            if (e.message === 'Password or username is incorrect') {
                result.res = 'Current Password is incorrect';

                return result;
            }

            result.error = true;
            this.log.error(e.message)
        }

        return result;
    }

}

export = User;
