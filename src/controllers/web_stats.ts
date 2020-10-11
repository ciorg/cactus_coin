import { Request } from 'express';
import Actions from './lib/actions';
import Visit from '../models/visit';
import * as I from '../interface';

// adustable time fram
// total visits
// graphed over time - every hour, day, month
// estimated unique visits
// by page
// by country?

class SiteStats {
    visit_actions: Actions;

    constructor() {
        this.visit_actions = new Actions(Visit);
    }

    async getData(period: number, unit: string) {
        const startTime = this._startTime(period, unit);
        const visits = await this.totalVisits(startTime);
        return this._countByTime(visits, unit);   
    }

    async totalVisits(startDate: string) {
        return Visit.find( { timestamp: { $gte: startDate } });
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

    private _countByTime(data: any[], unit: string) {
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
}

export = SiteStats;
