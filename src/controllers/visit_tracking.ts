import { Request } from 'express';
import crypto from 'crypto';
import useragent from 'express-useragent';
import Actions from './lib/actions';
import Visit from '../models/visit';
import * as I from '../interface';

class VisitTracker {
    visit_actions: Actions;

    constructor() {
        this.visit_actions = new Actions(Visit);
    }

    recordVisit(req: Request): void {
        const visitData: Partial<I.VisitDetails> = {
            timestamp: new Date(),
            ip_address: req.ip,
            base_url: req.baseUrl,
            hostname: req.hostname,
            path: req.path
        };

        const uaSource = req.headers['user-agent'];

        if (uaSource) {
            const ua = useragent.parse(uaSource);
            const uaDetails = this._getOtherDetails(ua);

            [
                'browser',
                'version',
                'os',
                'platform',
                'source',
                'electronVersion'
            ].forEach((field) => {
                if (ua[field]) visitData[field] = ua[field];
            });

            if (uaDetails.length > 0) {
                visitData.details = uaDetails;
            }
        }

        const shasum = crypto.createHash('md5');

        shasum.update(`${visitData.ip_address}, ${visitData.os}, ${visitData.platform}, ${visitData.browser}`, 'utf8');
        visitData.visit_id = shasum.digest('base64');

        console.log(visitData);
        this.visit_actions.create(visitData)
    }

    private _getOtherDetails(uaDetails: useragent.Details): string[] {
        return Object.entries(uaDetails).reduce((details: string[], entry) => {
            const [name, value] = entry;

            if (typeof value === 'boolean' && value === true) {
                details.push(name.slice(2).toLowerCase());
            }

            return details;
        }, []);
    }
}

export = VisitTracker;