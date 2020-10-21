import { Document } from 'mongoose';
import Actions from './lib/actions';
import Visit from '../models/visit';
import * as I from '../interface';

class SiteStats {
    visit_actions: Actions;

    constructor() {
        this.visit_actions = new Actions(Visit);
    }

    async getData(period: number, unit: string) {
        const startTime = this._startTime(period, unit);
        const visits = await this.totalVisits(startTime);

        const uniqueVisits = this._uniqVisits(visits, unit);
        const totalVisits = this._countByTime(visits, unit);
        const tallyByPage = this._countByPage(visits);
        const tallyByVisitor = this._countByVisitor(visits);

        return {
            uniqueVisits,
            totalVisits,
            tallyByPage: this._sortTallies(tallyByPage),
            tallyByVisitor: this._sortTallies(tallyByVisitor)
        }
    }

    async totalVisits(startDate: string) {
        return Visit.find( { timestamp: { $gte: startDate } });
    }

    private _uniqVisits(totalVisits: any[], unit: string) {
        const uniqVisitsByDate: { [prop: string]: string[] } =  totalVisits.reduce((tally, visit) => {
            const date = this._roundTime(visit.get('timestamp').toISOString(), unit);
            const key = this._getVisitorKey(visit);
            
            if (tally[date]) {
                if (tally[date].includes(key)) return tally;

                tally[date].push(key);
                return tally;
            }

            tally[date] = [key];
            return tally;
        }, {});

        const uniqVisitsTally: { [prop: string]: number } = {};

        for (const [key, value] of Object.entries(uniqVisitsByDate)) {
            uniqVisitsTally[key] = value.length;
        }

        return uniqVisitsTally;
    }

    private _startTime(period: number, unit: string) {
        const start = new Date().getTime() - (period * this._getTimesInSec(unit));

        const date = new Date(start).toISOString();

        return this._roundTime(date, unit);
    }

    private _getTimesInSec(unit: string): number {
        const hour = 3600 * 1000;
        const day = 24 * hour;
        const month = 30 * day;

        if(unit === 'day' || unit === 'days') return day;

        if(unit === 'month' || unit === 'months') return month;

        return hour;
    }

    private _roundTime(start: string, unit: string): string {
        // '2020-10-09T18:01:36.274Z'
        if (unit === 'month' || unit === 'months') return start.split('-').slice(0, 2).join('-');
        
        if (unit === 'day' || unit === 'days') return start.split('T')[0];

        return `${start.split(':')[0]}:00:00`;
    }

    private _countByTime(data: any[], unit: string): { [prop: string]: number } {
        return data.reduce((tally, doc) => {
            const date = this._roundTime(doc.get('timestamp').toISOString(), unit);
            
            if (tally[date]) {
                tally[date] ++;
                return tally;
            }

            tally[date] = 1;
            return tally;
        }, {});
    }

    private _countByPage(data: Document[]): { [prop: string]: number} {
        return data.reduce((tally, doc) => {
            const page = doc.get('path');

            if (tally[page]) {
                tally[page]++;
                return tally;
            }

            tally[page] = 1;

            return tally;
        }, {})
    }

    private _countByVisitor(data: Document[]): { [prop: string]: number } {
        return data.reduce((tally, doc) => {
            const key = this._getVisitorKey(doc);

            if (tally[key]) {
                tally[key]++;
                return tally;
            }

            tally[key] = 1;

            return tally;
        }, {})
    }

    private _getVisitorKey(doc: Document) {
        return doc.get('ip_address') + doc.get('os') + doc.get('browser');
    }

    private _sortTallies(data: { [prop: string]: number }): [string, number][] {
        return Object.entries(data).sort((a, b) => b[1] - a[1]);
    }
}

export = SiteStats;
