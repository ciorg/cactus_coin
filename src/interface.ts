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
    ip_address?: String;
    base_url?: String;
    hostname?: String;
    path?: String;
    browser?: String;
    version?: String;
    os?: String;
    platform?: String;
    source?: String;
    electron_version?: String;
    details?: String[];
}