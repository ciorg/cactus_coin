import mongoose from 'mongoose';
import Rb from '../../src/controllers/rb';
import UserModel from '../../src/models/user';
import RatingModel from '../../src/models/rating';
import WriteUpModel from '../../src/models/write_up';

describe('ratings', () => {
    let connection: any;
    let user: any;
    let rb: any;

    beforeAll(async () => {
        const url = `mongodb://localhost/rb_controller`;

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

        rb = new Rb();
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    describe('create', () => {
        it('should create a new rb', async () => {

            const req: any = {
                user: { _id: user._id },
                body: {
                    rb_brand_name: 'new test rb'
                },
                file: {
                    filename: 'rb_file_name'
                }
            };
            
            const result = await rb.create(req);

            expect(result.res._id).toBeDefined();
            expect(result.res.name).toBe('new test rb');
            expect(result.res.image).toBe('rb_imgs/rb_file_name');
            expect(result.res.user).toEqual(String(user._id));
        });
    });

    describe('update', () => {
        it('should update an existing rb', async () => {

            const req: any = {
                user: { _id: user._id },
                body: {
                    rb_brand_name: 'update test rb'
                },
                file: {
                    filename: 'update_file_name'
                }
            };
            
            const result = await rb.create(req);

            const updateReq: any = {
                params: { id: result.res.get('_id') },
                body: {
                    rb_brand_name: 'updated rb'
                },
                file: {
                    filename: 'better_pic'
                }
            };

            const updated = await rb.update(updateReq);
            expect(updated.res.ok).toBe(1);
        });
    });

    describe('getUsersRb', () => {
        it('should get all ther rb for a user', async () => {

            const req: any = {
                user: { _id: user._id }
            };
            
            const result = await rb.getUsersRb(req);
            expect(result.res.length).toBe(2);
        });
    });

    describe('webSearch', () => {
        it('should return rb that match search', async () => {

            const req: any = {
               body: { rb_search: 'updated'}
            };
            
            const result = await rb.webSearch(req, 'name');

            expect(result.res.length).toBe(1);
            expect(result.res[0].name).toBe('updated rb');
        });
    });

    describe('viewRbInfo', () => {
        it('should return all the info about the rb that match search', async () => {
            const rbReq: any = {
                user: { _id: user._id },
                body: {
                    rb_brand_name: 'test rb info'
                },
                file: {
                    filename: 'rb_file_name'
                }
            };
            
            const rbDoc = await rb.create(rbReq);

           await RatingModel.create({
                user: user._id,
                rb_id: rbDoc.res._id,
                created: new Date(),
                branding: 7,
                after_taste: 4,
                aroma: 8,
                bite: 7,
                flavor: 5,
                smoothness: 9,
                carbonation: 6,
                sweetness: 8,
                total: 78
            }); 

            await WriteUpModel.create({
                user: user._id,
                rb_id: rbDoc.res._id,
                created: new Date(),
                write_up: 'this is some write up'
            });

            const testReq: any = {
                params: { id: rbDoc.res._id }
            }

            const testResult = await rb.viewRbInfo(testReq);

            expect(testResult.res.rb._id).toStrictEqual(rbDoc.res._id);
            expect(testResult.res.rb.name).toBe('test rb info');
            expect(testResult.res.ratings.length).toBe(1);

            expect(testResult.res.ratings[0].get('aroma')).toBe(8);

            expect(testResult.res.writeUps.length).toBe(1);

            expect(testResult.res.writeUps[0].get('write_up')).toBe('this is some write up');
            expect(testResult.res.avg).toEqual({
                    branding: '7.0',
                    after_taste: '4.0',
                    aroma: '8.0',
                    bite: '7.0',
                    carbonation: '6.0',
                    flavor: '5.0',
                    smoothness: '9.0',
                    sweetness: '8.0',
                    total: '78.0'
            });
        });
    });
});