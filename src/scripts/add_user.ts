import userModel from '../models/user';


async function register() {
    try {
        const user = await userModel.register({
            username: 'ciorg',
            active: true,
            role: 'king',
            registered: new Date()
        }, 'changeMe123');

        console.log('registered', user);
    } catch (e) {
        console.log(e);
    }
    return;
}

register();
