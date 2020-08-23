import mongoose from 'mongoose';
import UserModel from '../../src/models/user';
import RBModel from '../../src/models/rb';
import WriteUpModel from '../../src/models/write_up';
import WriteUp from '../../src/controllers/write_ups';

describe('ratings', () => {
    let connection: any;
    let user: any;
    let rb: any;
    let writeUp:WriteUp;

    beforeAll(async () => {
        const url = `mongodb://localhost/write_up_controller`;

        connection = await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });

         user = await UserModel.register({ 
            username: 'test_user',
            active: true,
            role: 'rater',
            created: new Date()
        }, 'some_pass_sord');

        rb = await RBModel.create({
            name: 'test_rb',
            created: new Date(),
            user: user._id,
            image: 'some/image/location'
        });


        writeUp = new WriteUp();
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    describe('create', () => {
        it('should create a new write up', async () => {
            const req: any = {
                user: { _id: user._id },
                params: { id: rb._id },
                body: { write_up: 'this is the write up' }
            };

            const created = await writeUp.create(req);

            expect(created.res.write_up).toBe('this is the write up');
        });
    });

    describe('update', () => {
        it('should update the write up', async () => {
            const req: any = {
                user: { _id: user._id },
                params: { id: rb._id },
                body: { write_up: 'this is another write up' }
            };

            const created = await writeUp.create(req);

            const updateReq: any = {
                params: { id: created.res._id },
                body: { write_up: 'updated write up' }
            };

            const updated = await writeUp.update(updateReq);
            expect(updated.res.ok).toBe(1);

            const updatedDoc: any = await WriteUpModel.findById(created.res._id);
            expect(updatedDoc.get('write_up')).toBe('updated write up')
        });
    });

    describe('update', () => {
        it('should update the write up', async () => {
            const req: any = {
                user: { _id: user._id },
                params: { id: rb._id },
                body: { write_up: 'delete this write up' }
            };

            const created = await writeUp.create(req);

            const delReq: any = { params: { id: created.res._id } };
            const deleted = await writeUp.delete(delReq);

            expect(deleted.res.deletedCount).toBe(1);
        });
    });

    describe('ratingsByUser', () => {
        it('should return ratings by user id', async () => {
            const userReq: any = {
                user: { _id: user._id }
            };

            const userWriteUps = await writeUp.writeUpsByUser(userReq);

            expect(userWriteUps.res.length).toBe(2);
        });
    });
});