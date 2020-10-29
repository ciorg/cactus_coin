import { Request } from 'express';
import useragent from 'express-useragent';
import axios from 'axios';
import Actions from './lib/actions';
import Visit from '../models/visit';
import IPAddressModel from '../models/ip_address';
import Logger from '../utils/logger';
import * as I from '../interface';

class VisitTracker {
    visit_actions: Actions;
    ip_actions: Actions;
    logger: Logger;

    constructor() {
        this.logger = new Logger();
        this.visit_actions = new Actions(Visit);
        this.ip_actions = new Actions(IPAddressModel);
    }

    recordVisit(req: Request): void {
        const visitData = Object.assign(
            this._getReqData(req),
            this._getUADetails(req)
        );

        this.visit_actions.create(visitData)
    }

    private _getReqData(req: Request) {
        const ipAddress = this._getIpAddress(req);

        this._logIpAddress(ipAddress);
    
        const reqData: Partial<I.VisitDetails> = {
            timestamp: new Date(),
            ip_address: ipAddress,
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

    private _getIpAddress(req: Request) {
        const ip = req.headers['x-forwarded-for'] || 
            req.connection.remoteAddress || req.socket.remoteAddress;

        if (Array.isArray(ip)) return ip[0].trim();

        if (ip == null) return '127.0.0.1';

        if (typeof ip === 'string' && ip.includes(':') && ip.includes('.')) {
            const lastColon = ip.lastIndexOf(':');
            return ip.slice(lastColon + 1,);
        }

        return ip.split(',')[0].trim();
    }

    private async _logIpAddress(ipAddress: string): Promise<void> {
        const ipData: I.IPData | undefined = await this._getIpData(ipAddress);

        if (ipData) {
            this.ip_actions.upsert({ ip_address: ipAddress }, ipData);
        }
    }

    private async _getIpData(ipAddress: string): Promise<I.IPData | undefined> {
        const url = `https://ipapi.co/${ipAddress}/json`;
    
        try {
            const result = await axios.get(url);

            return {
                updated: new Date(),
                ip_address: ipAddress,
                version: result.data.version,
                country: result.data.country,
                region: result.data.region,
                region_code: result.data.region_code,
                city: result.data.city,
                country_name: result.data.country_name,
                country_code: result.data.country_code,
                country_code_iso3: result.data.country_code_iso3,
                continent_code: result.data.continent_code,
                latitude: result.data.latitude,
                longitude: result.data.longitude,
                asn: result.data.asn,
                org: result.data.org    
            };
             
        } catch(e) {
            this.logger.error('could not collect data from ip', { err: e });
        }

        return;
    }
}

export = VisitTracker;