import { Request } from 'express';
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
        const visitData = Object.assign(
            this._getReqData(req),
            this._getUADetails(req)
        );

        this.visit_actions.create(visitData)
    }

    private _getReqData(req: Request) {
        const reqData: Partial<I.VisitDetails> = {
            timestamp: new Date(),
            ip_address: req.ip,
            hostname: req.hostname,
            path: req.path
        };

        if (req.baseUrl) {
            reqData.base_url = req.baseUrl;
        }

        return reqData;
    }

    private _getUADetails(req: Request) {
        const uaDetails: Partial<I.VisitDetails> = {};
    
        if (req.headers['user-agent']) {
            const ua = useragent.parse(req.headers['user-agent']);

            [
                'browser',
                'version',
                'os',
                'platform',
                'source',
            ].forEach((field) => {
                if (ua[field]) uaDetails[field] = ua[field];
            });

            const details = this._getOtherDetails(ua);
    
            if (details.length > 0) {
                uaDetails.details = details;
            }
        }

        return uaDetails;
    }

    private _getOtherDetails(uaDetails: useragent.Details): string[] {
        return Object.entries(uaDetails).reduce((details: string[], [name, value]) => {
            if (typeof value === 'boolean' && value === true) {
                details.push(name.slice(2).toLowerCase());
            }

            return details;
        }, []);
    }
}

export = VisitTracker;