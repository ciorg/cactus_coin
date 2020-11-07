import mongoose from 'mongoose';
import SiteStats from '../../src/controllers/web_stats';
import IpModel from '../../src/models/ip_address';
import Actions from '../../src/controllers/lib/actions';


const siteStats = new SiteStats();

class Doc {
    timestamp: Date;
    ip_address: string;
    os: string;
    browser: string;
    path: string;
    constructor(args: { time: string, ip: string, os: string, browser: string , path: string}) {
        this.timestamp = new Date(args.time);
        this.ip_address = args.ip;
        this.os = args.os;
        this.browser = args.browser;
        this.path = args.path;
    }

    get(value: string) {
        return this[value];
    }
}

const docs = [
    { time: '2020-10-21T01:00:00.000Z', ip: '1.2.3.4', os: 'linux', browser: 'chrome', path: 'page1' },
    { time: '2020-10-21T02:00:00.000Z', ip: '1.2.3.5', os: 'linux', browser: 'chrome', path: 'page2' },
    { time: '2020-10-21T02:00:00.000Z', ip: '1.2.3.4', os: 'mac', browser: 'chrome', path: 'page3' },
    { time: '2020-10-22T03:00:00.000Z', ip: '1.2.3.4', os: 'linux', browser: 'chrome', path: 'page1' },
    { time: '2020-10-22T02:00:00.000Z', ip: '1.2.3.4', os: 'linux', browser: 'chrome', path: 'page1' },
    { time: '2020-10-26T04:00:00.000Z', ip: '1.2.3.4', os: 'linux', browser: 'chrome', path: 'page1' },
    { time: '2020-10-22T01:00:00.000Z', ip: '1.2.3.4', os: 'linux', browser: 'chrome', path: 'page4' },
    { time: '2020-10-21T01:00:00.000Z', ip: '1.2.3.4', os: 'linux', browser: 'chrome', path: 'page1' },
    { time: '2020-10-24T01:00:00.000Z', ip: '1.2.3.4', os: 'linux', browser: 'chrome', path: 'page2' },
    { time: '2020-10-26T01:00:00.000Z', ip: '1.2.3.4', os: 'linux', browser: 'explorer', path: 'page1' }
].map((d) => new Doc(d));

describe('site stats', () => {
    const siteStatProto = Object.getPrototypeOf(siteStats);

    describe('_uniqVisits', () => {
        it('should return only uniq visiter for the day', () => {                
            const result = siteStatProto._uniqVisits(docs, 'day');
            
            expect(result).toEqual({
                '2020-10-21': 3,
                '2020-10-22': 1,
                '2020-10-24': 1,
                '2020-10-26': 2
            });
        });

        it('should return only uniq visiter for the hour', () => {                
            const result = siteStatProto._uniqVisits(docs, 'hour');

            expect(result).toEqual({
                "2020-10-21T01:00:00": 1,
                "2020-10-21T02:00:00": 2,
                "2020-10-22T01:00:00": 1,
                "2020-10-22T02:00:00": 1,
                "2020-10-22T03:00:00": 1,
                "2020-10-24T01:00:00": 1,
                "2020-10-26T01:00:00": 1,
                "2020-10-26T04:00:00": 1
            });
        });
    });

    describe('_getTimesInSec', () => {
        it('should return seconds for each time unit', () => {              
            expect(siteStatProto._getTimesInSec('hour')).toBe(3600000);
            expect(siteStatProto._getTimesInSec('day')).toBe(86400000);
            expect(siteStatProto._getTimesInSec('month')).toBe(86400000 * 30);
            
        });
    });

    describe('_roundTime', () => {
        it('should return time rounded to specified time unit', () => {              
            expect(siteStatProto._roundTime('2020-10-09T18:01:36.274Z', 'hour')).toBe('2020-10-09T18:00:00');
            expect(siteStatProto._roundTime('2020-10-09T18:01:36.274Z', 'day')).toBe('2020-10-09');
            expect(siteStatProto._roundTime('2020-10-09T18:01:36.274Z', 'month')).toBe('2020-10');
            
        });
    });

    describe('_countByTime', () => {
        it('it should count docs by day', () => {
            const countByDay = siteStatProto._countByTime(docs, 'day');
            const countByHour = siteStatProto._countByTime(docs, 'hour');
            const countByMonth = siteStatProto._countByTime(docs, 'month');

            expect(countByDay).toEqual({
                '2020-10-21': 4,
                '2020-10-22': 3,
                '2020-10-26': 2,
                '2020-10-24': 1
            });

            expect(countByHour).toEqual({
                '2020-10-21T01:00:00': 2,
                '2020-10-21T02:00:00': 2,
                '2020-10-22T01:00:00': 1,
                '2020-10-22T02:00:00': 1,
                '2020-10-22T03:00:00': 1,
                '2020-10-24T01:00:00': 1,
                '2020-10-26T01:00:00': 1,
                '2020-10-26T04:00:00': 1
            });

            expect(countByMonth).toEqual({
                '2020-10': 10
            });

            expect(totalCounts(countByDay)).toBe(10);
            expect(totalCounts(countByHour)).toBe(10);
            expect(totalCounts(countByMonth)).toBe(10);
        });
    });

    describe('_countByPage', () => {
        const countByPage = siteStatProto._countByField(docs, 'path');
        expect(countByPage).toEqual({
            page1: 6,
            page2: 2,
            page3: 1,
            page4: 1
        });

        expect(totalCounts(countByPage)).toBe(10);
    });

    describe('_sortyByTally', () => {
        const countByVisitor = siteStatProto._countByField(docs, 'browser');
        
        const sorted = siteStatProto._sortTallies(countByVisitor);

        expect(sorted).toEqual([
            ['chrome', 9],
            ['explorer', 1]
        ]);

        expect(totalCounts(countByVisitor)).toBe(10);
    });

    describe('_getTotal', () => {
        it('should get total from tally object', () => {
            const countByPage = siteStatProto._countByField(docs, 'path');

            const totalCount = siteStatProto._getTotal(countByPage);

            expect(totalCount).toBe(10);
        });
    });

    describe('_addIpCountry', () => {
        let ipActions: Actions;

        beforeAll(async () => {
            const url = `mongodb://localhost/ip_controller`;
    
            await mongoose.connect(url, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true
            });
            
            ipActions = new Actions(IpModel);
        });
    
        afterAll(async () => {
            await mongoose.connection.dropDatabase();
            await mongoose.disconnect();
        });

        it('should add country to ip', async () => {
            const ipAddress1 = {
                updated: '2020-11-07T04:39:53.854Z',
                ip_address: '1.2.3.4',
                version: 'ipv4',
                region: 'Some Region',
                region_code: 'SR',
                city: 'Moscow',
                country_name: 'Russia',
                country_code: 'RU',
                continent_code: 'EU',
                latitude: 37.3861,
                longitude: 40.1231,
                asn: 'AS15169',
                org: 'Google LLC'   
            };

            const ipAddress2 = {
                updated: '2020-11-07T04:39:53.854Z',
                ip_address: '1.2.3.5',
                version: 'ipv4',
                region: 'Some Region',
                region_code: 'SR',
                city: 'Place',
                country_name: 'United States',
                country_code: 'US',
                continent_code: 'NA',
                latitude: 37.3861,
                longitude: 40.1231,
                asn: 'AS15169',
                org: 'Google LLC'   
            };

            await ipActions.upsert({ ip_address: '1.2.3.4' }, ipAddress1);
            await ipActions.upsert({ ip_address: '1.2.3.5' }, ipAddress2);
            
            const ipData = siteStatProto._addIpCountry(docs);

        });
    });
});

function totalCounts(tally: { [propname: string]: number}): number {
    return Object.values(tally).reduce((count: number, num: number) => {
        const tally = count + num;

        return tally;
    }, 0);
}
