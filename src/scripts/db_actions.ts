import DB from '../utils/db';
import UserModel from '../models/user';
import RbModel from '../models/rb';
import RatingModel from '../models/rating';
import WriteUpModel from '../models/write_up';
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
        console.log(allUsers);
    }

    async clearWriteUps() {
        const allWriteUps = await WriteUpModel.deleteMany({});
        console.log(allWriteUps);
    }
    
    async clearAll() {
        await this.clearWriteUps();
        console.log('cleared write ups');

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

        await this.addWriteUp(1);
        console.log('write up added');
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

            await RbModel.create(rbInfo);
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
                branding: Math.round((Math.random() * 10)),
                flavor: Math.round((Math.random() * 10)),
                aroma: Math.round((Math.random() * 10)),
                after_taste: Math.round((Math.random() * 10)),
                bite: Math.round((Math.random() * 10)),
                carbonation: Math.round((Math.random() * 10)),
                sweetness: Math.round((Math.random() * 10)),
                smoothness: Math.round((Math.random() * 10)),
                total: Math.round((Math.random() * 100))
            }
    
            await RatingModel.create(ratingInfo);
        }
    }

    async addWriteUp(num: Number) {
        const userId = await UserModel.find({ username: 'ciorg'}, '_id');
        const rbId = await RbModel.find({ name: 'test_0'}, '_id');

        for (let i = 0; i < num; i++) {
            const writeUpInfo = {
                rb_id: rbId[0]._id,
                created: Date.now(),
                user: userId[0]._id,
                write_up: 'this is a write up'
            }
    
            await WriteUpModel.create(writeUpInfo);
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

        await dbTools.addRbs(num);
    }

    if (func === 'addRating') {
        let num = 1;
    
        if (args.length === 4) num = Number(args[3]);

        await dbTools.addRating(num);
    }

    if (func === 'addWriteUp') {
        let num = 1;
    
        if (args.length === 4) num = Number(args[3]);

        await dbTools.addWriteUp(num);
    }

    await dbTools[func]();

    await db.close();
    console.log('closing');
}

runFunction(args);
    







    