import mongoose from 'mongoose';
import Action from '../../src/controllers/lib/actions';
import RbModel from '../../src/models/rb';

fdescribe('Action', () => {
    let connection: any;

    beforeAll(async () => {
        const url = `mongodb://localhost/action_tests`;

        connection = await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    describe('create', () => {
        let rbActions: any;

        beforeAll(() => rbActions = new Action(RbModel));

        it('should create new rb when rb model instantiates actions', async () => {

            const result = await rbActions.create({
                name: 'create_rb_test',
                created: new Date(),
                user: 'some_user_id'
            });

            expect(result.res.get('user')).toBe('some_user_id');
        });

        it('should throw an error if root beer is already created', async () => {
            const result = await rbActions.create({
                name: 'create_rb_err_test',
                created: new Date(),
                user: 'some_user_id'
            });

            const result2 = await rbActions.create({
                name: 'create_rb_err_test',
                created: new Date(),
                user: 'some_user_id'
            });

            expect(result2.error).toBe(true);
        });
    });
});