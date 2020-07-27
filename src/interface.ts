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
}

interface RBOwned extends RBEntity {
    rb_id: string;
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

export interface ErrorObject {
    err: Error;
    req?: Request;
    res?: Response;
}

export interface LogObject {
    req?: Request;
    res?: Response;
}