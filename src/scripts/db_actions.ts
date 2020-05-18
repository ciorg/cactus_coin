import userModel from '../models/user';
import  rb from '../models/rb';
import ratings from '../models/rb_ratings';
import bunyan from 'bunyan';

const log = bunyan.createLogger({
    name: 'clear data'
});

async function clear() {
    const allRatings = await ratings.deleteMany({});
    log.info(allRatings);

    const allRb = await rb.deleteMany({});
    log.info(allRb);

    const allUsers = await userModel.deleteMany({});
    log.info(allUsers);

    return;
}

async function initUser() {
    try {
        const user = await userModel.register({
            username: 'ciorg',
            active: true,
            role: 'king',
            date: new Date()
        }, 'changeMe123');

        log.info('registered', user);
    } catch (e) {
        log.info(e);
    }
    return;
}

// clear();
initUser();