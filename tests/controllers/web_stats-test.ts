import SiteStats from '../../src/controllers/web_stats';

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
    describe('_uniqVisits', () => {
        it('should return only uniq visiter for the day', () => {    
            const exampleProto = Object.getPrototypeOf(siteStats);
            
            const result = exampleProto._uniqVisits(docs, 'day');
            
            expect(result).toEqual({
                '2020-10-21': 3,
                '2020-10-22': 1,
                '2020-10-24': 1,
                '2020-10-26': 2
            });
        });

        it('should return only uniq visiter for the hour', () => {    
            const exampleProto = Object.getPrototypeOf(siteStats);
            
            const result = exampleProto._uniqVisits(docs, 'hour');

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
            const siteStatProto = Object.getPrototypeOf(siteStats);
            
            expect(siteStatProto._getTimesInSec('hour')).toBe(3600000);
            expect(siteStatProto._getTimesInSec('day')).toBe(86400000);
            expect(siteStatProto._getTimesInSec('month')).toBe(86400000 * 30);
            
        });
    });

    describe('_roundTime', () => {
        it('should return time rounded to specified time unit', () => {  
            const siteStatProto = Object.getPrototypeOf(siteStats);
            
            expect(siteStatProto._roundTime('2020-10-09T18:01:36.274Z', 'hour')).toBe('2020-10-09T18:00:00');
            expect(siteStatProto._roundTime('2020-10-09T18:01:36.274Z', 'day')).toBe('2020-10-09');
            expect(siteStatProto._roundTime('2020-10-09T18:01:36.274Z', 'month')).toBe('2020-10');
            
        });
    });

    describe('_countByTime', () => {
        it('it should count docs by day', () => {
            const siteStatProto = Object.getPrototypeOf(siteStats);
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
        const siteStatProto = Object.getPrototypeOf(siteStats);

        const countByPage = siteStatProto._countByPage(docs);
        expect(countByPage).toEqual({
            page1: 6,
            page2: 2,
            page3: 1,
            page4: 1
        });

        expect(totalCounts(countByPage)).toBe(10);
    });

    describe('_countByVisity', () => {
        const siteStatProto = Object.getPrototypeOf(siteStats);

        const countByVisitor = siteStatProto._countByVisitor(docs);
        expect(countByVisitor).toEqual({
            '1.2.3.4linuxchrome': 7,
            '1.2.3.4macchrome': 1,
            '1.2.3.4linuxexplorer': 1,
            '1.2.3.5linuxchrome': 1,
        });

        expect(totalCounts(countByVisitor)).toBe(10);
    });

    describe('_sortyByTally', () => {
        const siteStatProto = Object.getPrototypeOf(siteStats);

        const countByVisitor = siteStatProto._countByVisitor(docs);
        
        const sorted = siteStatProto._sortTallies(countByVisitor);

        expect(sorted).toEqual([
            ['1.2.3.4linuxchrome', 7],
            ['1.2.3.5linuxchrome', 1],
            ['1.2.3.4macchrome', 1],
            ['1.2.3.4linuxexplorer', 1]
        ]);

        expect(totalCounts(countByVisitor)).toBe(10);
    });
});

function totalCounts(tally: { [propname: string]: number}): number {
    return Object.values(tally).reduce((count: number, num: number) => {
        const tally = count + num;

        return tally;
    }, 0);
}
