import DB from '../utils/db';
import UserModel from '../models/user';
import RbModel from '../models/rb';
import RatingModel from '../models/rating';
import Logger from '../utils/logger';

class DBTools {
    log: Logger;

    constructor() {
        this.log = new Logger();
    }
    
    async clearRatings() {
        const allRatings = await RatingModel.deleteMany({});
        console.log(allRatings);
    }
    
    async clearRbs() {
        const allRb = await RbModel.deleteMany({});
        console.log(allRb);
    }
    
    async clearUsers() {
        const allUsers = await UserModel.deleteMany({});
        this.log.debug(allUsers);
    }
    
    async clearAll() {
        await this.clearRatings();
        console.log('cleared ratings');

        await this.clearRbs();
        console.log('cleared rbs');

        await this.clearUsers();
        console.log('cleared users');
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
            console.log(rb);
        }
    }
}

const dbTools = new DBTools();

const args = process.argv;

async function runFunction(args: string[]) {
    const db = new DB();
    await db.connect();

    const func = args[2];

    if (func === 'addRbs') {
        let num = 1;
    
        if (args.length === 4) num = Number(args[3]);

        await dbTools[func](num);
        return;
    }

    await dbTools[func]();

    await db.close();
    console.log('closing');
}

runFunction(args);
    







    