import { Request, Response } from 'express';

export interface RootBeer {
    _id: string;
    name: string;
    created: Date;
    user: string;
    image?: string;
    rating?: number;
    rank?: number;
    popular?: number;
}

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

export interface Rating {
    rb_id: string;
    created: Date;
    user: string;
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

export interface WriteUp {
    rb_id: string;
    created: Date;
    user: string;
    write_up: string;
}

export interface ConfigSettings {
    mongo_settings: { url: string, database: string};
    env: string;
    log_level: string;
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