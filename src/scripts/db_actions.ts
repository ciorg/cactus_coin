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

    async addTestData() {
        console.log('clearing');
        await this.clearAll();

        await this.initUser();
        console.log('user added');

        await this.addRbs(1);
        console.log('rb added');

        await this.addRating(1);
        console.log('rating adding');
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

    async addRating(num: Number) {
        const userId = await UserModel.find({ username: 'ciorg'}, '_id');
        const rbId = await RbModel.find({ name: 'test_0'}, '_id');
    
        for (let i = 0; i < num; i++) {
            const ratingInfo = {
                rb_id: rbId[0]._id,
                created: Date.now(),
                user: userId[0]._id,
                branding: 7,
                flavor: 7,
                aroma: 7,
                after_taste: 7,
                bite: 7,
                carbonation: 7,
                sweetness: 7,
                smoothness: 7,
                total: 84
            }
    
            const rating = await RatingModel.create(ratingInfo);
            console.log(rating);
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
    }

    await dbTools[func]();

    await db.close();
    console.log('closing');
}

runFunction(args);
    







    