import mongoose from 'mongoose';
import Utils from '../../src/controllers/lib/utils';
import RbModel from '../../src/models/rb';
import RatingsModel from '../../src/models/rating';
import RatingModel from '../../src/models/rating';

const utils = new Utils();

describe('utils', () => {
    beforeAll(async () => {
        const url = `mongodb://localhost/testCactus`;

        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('addUserName', () => {
        it('should add the username to rb docs', async () => {
            const rb: any = await RbModel.findOne();
            await utils.addUserName([rb]);
            
            expect(rb.user).toBe('ciorg');
        });

        it('should add the username to ratings docs', async () => {
            const rating: any = await RatingModel.findOne();
            await utils.addUserName([rating]);
            
            expect(rating.user).toBe('ciorg');
        });
    });
});
