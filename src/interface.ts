import { Request, Response } from 'express';

export interface User {
    username: string;
    password: string;
    role: string;
    registered: Date;
    active: boolean;
    _id: string;
}

export interface Result {
    res: any;
    error?: boolean;
}

interface RBEntity{
    created: Date | string;
    user: string;
}

export interface RootBeer extends RBEntity {
    _id: string;
    name: string;
    image?: string;
    rating?: number;
    rank?: number;
    popular?: number;
    write_up?: string;
    title?: string;
}

interface RBOwned extends RBEntity {
    rb_id: string;
    rb_name?: string;
}

export interface Rating extends RBOwned {
    branding: number;
    after_taste: number;
    aroma: number;
    bite: number;
    carbonation: number;
    flavor: number;
    smoothness: number;
    sweetness: number;
    total: number;
    comment: string;
}

export interface WriteUp extends RBOwned {
    write_up: string;
}

export interface ConfigSettings {
    mongo_settings: { url: string, database: string};
    env: string;
    log_level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | number;
    log_path: string;
    secret: string;
    port: number
}

export interface LogObject {
    err?: Error;
    req?: Request;
    res?: Response;
}

export interface VisitDetails {
    timestamp: Date | string;
    ip_address?: string;
    base_url?: string;
    hostname?: string;
    path?: string;
    browser?: string;
    version?: string;
    os?: string;
    platform?: string;
    source?: string;
    electron_version?: string;
    details?: string[];
}

export interface StatsData {
    error: boolean;
    uniqueVisits: number;
    totalVisits: number;
    uniqueVisitsOverTime: { [prop: string]: number; };
    totalVisitsOverTime: { [prop: string]: number; };
    tallyByPage: [string, number][];
    tallyByOs: [string, number][];
    tallyByBrowser: [string, number][];
    tallyByIp: [string, [string, number]][];
    tallyByCountry: [string, number][];
}

export interface IPData {
    updated: Date;
    ip_address: string;
    version: string;
    region: string;
    region_code: string;
    city: string;
    country_name: string;
    country_code: string;
    continent_code: string;
    latitude: Number;
    longitude: Number;
    asn: string;
    org: string;
}

export interface CoinOpts {
    id: string;
    unit: string;
    value: number
}

export interface Note {
    user: string;
    id: string;
    created: Date;
    content: string;
    title: string;
    tags?: string[];
}