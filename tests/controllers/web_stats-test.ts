import SiteStats from '../../src/controllers/web_stats';

const siteStats = new SiteStats();

class Doc {
    timestamp: Date;
    constructor(time: string) {
        this.timestamp = new Date(time);
    }

    get(value: string) {
        return this.timestamp;
    }
}

describe('site stats', () => {
    describe('_uniqVisits', () => {
        const docs = [
            '2020-10-21T01:00:00.000Z',
            '2020-10-21T01:00:00.000Z',
            '2020-10-21T01:00:00.000Z',
            '2020-10-22T01:00:00.000Z',
            '2020-10-22T01:00:00.000Z',
            '2020-10-26T01:00:00.000Z',
            '2020-10-22T01:00:00.000Z',
            '2020-10-21T01:00:00.000Z',
            '2020-10-24T01:00:00.000Z',
            '2020-10-26T01:00:00.000Z'
        ].map((d) => new Doc(d));

        it('should return only uniq visiter for the day', () => {    
            const exampleProto = Object.getPrototypeOf(siteStats);
            
            const result = exampleProto._uniqVisits(docs, 'day');

            console.log(result);
            
            expect(result).toEqual({
                '2020-10-21': 4,
                '2020-10-22': 3,
                '2020-10-24': 1,
                '2020-10-26': 2
            });
        });
    });
});
