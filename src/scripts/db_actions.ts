import UserModel from '../models/user';
import RbModel from '../models/rb';
import RatingModel from '../models/rb_ratings';
import bunyan from 'bunyan';

class DBTools {
    log: bunyan;

    constructor() {
        this.log = bunyan.createLogger({ name: 'db tools' });
    }
    
    async clearRatings() {
        const allRatings = await RatingModel.deleteMany({});
        this.log.info(allRatings);
    }
    
    async clearRbs() {
        const allRb = await RbModel.deleteMany({});
        this.log.info(allRb);
    }
    
    async clearUsers() {
        const allUsers = await UserModel.deleteMany({});
        this.log.info(allUsers);
    }
    
    async clearAll() {
        await this.clearRatings();
        await this.clearRbs();
        await this.clearUsers();
    }
    
    async initUser() {
        try {
            const user = await UserModel.register({
                username: 'ciorg',
                active: true,
                role: 'king',
                date: new Date()
            }, 'changeMe123');
            
            this.log.info('registered', user);
        } catch (e) {
            this.log.info(e);
        }
        return;
    }

    async addRbs(num: Number) {
        const userId = await UserModel.find({ username: 'ciorg' }, '_id');

        this.log.info(userId);

        for (let i = 0; i < num; i++) {
            const rbInfo = {
                name: `test_${i}`,
                created: Date.now(),
                user: userId[0]._id
            };

            const rb = await RbModel.create(rbInfo);
            this.log.info(rb);
        }
    }
}

const dbTools = new DBTools();

const args = process.argv;

async function runFunction(args: string[]) {
    const func = args[2];

    if (func === 'addRbs') {
        let num = 1;
    
        if (args.length === 4) num = Number(args[3]);

        await dbTools[func](num);
        return;
    }

    await dbTools[func]();
}

runFunction(args);
    







    